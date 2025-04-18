// /utils/database.ts

import { MongoClient } from "https://deno.land/x/mongo/mod.ts";
import "@std/dotenv/load";

import { log } from "./log.ts";
import { generateCombinationsFromMap } from "./combinations.ts";

log(`Loaded: /utils/database.ts`);

type ValueMap = Record<string, string[]>;

const MONGODB_ADMIN_USER = Deno.env.get("MONGODB_ADMIN_USER") || "user";
const MONGODB_ADMIN_PASS = Deno.env.get("MONGODB_ADMIN_PASS") || "password";
const MONGODB_HOST_ADRESS = Deno.env.get("MONGODB_HOST_ADRESS") || "localhost";
const MONGODB_HOST_PORT = Deno.env.get("MONGODB_HOST_PORT") || "27017";
const MONGODB_DB_NAME = Deno.env.get("MONGODB_DB_NAME") || "sensordb";

const originalEnvValues = {
    user: MONGODB_ADMIN_USER,
    password: MONGODB_ADMIN_PASS,
    host: MONGODB_HOST_ADRESS,
    port: MONGODB_HOST_PORT,
    dbName: MONGODB_DB_NAME,
};

const valueMap = {
    user: [`${MONGODB_ADMIN_USER}`, "admin", "user"],
    password: [`${MONGODB_ADMIN_PASS}`, "abc123", "password"],
    host: [MONGODB_HOST_ADRESS, "localhost", "127.0.0.1", "mongo", "mongo-db"],
    port: [MONGODB_HOST_PORT, "27017", "27018"],
    dbName: [MONGODB_DB_NAME],
} as const;

const combinations = generateCombinationsFromMap(valueMap);

// Declare a global client instance to maintain a single connection throughout the application.
let client: MongoClient | null = null;


// function to connect to the MongoDB database.
async function connectToMongoDB(databaseName: string) {
    // If a client connection already exists, reuse it to avoid creating multiple connections.
    if (client) {
        return client.database(databaseName);
    }

    // Initialize a new MongoClient instance.
    client = new MongoClient();
    try {
        const workingCombo = await testAllMongoDBConnections();
        const uri = `mongodb://${workingCombo.user}:${workingCombo.password}@${workingCombo.host}:${workingCombo.port}/admin`;

        // Check and log differences from .env values
        const incorrectEnvVars: (keyof typeof originalEnvValues)[] = [];
        const keys = Object.keys(originalEnvValues) as (keyof typeof originalEnvValues)[];
        for (const key of keys) {
          if (originalEnvValues[key] !== workingCombo[key]) {
            incorrectEnvVars.push(key);
          }
        }

        if (incorrectEnvVars.length > 0) {
            log(
              `⚠️ The following environment values were incorrect and had to be overridden:\n` +
              incorrectEnvVars.map((key) => {
                const original = key === "password" ? "********" : `"${originalEnvValues[key]}"`;
                const actual = key === "password" ? "********" : `"${workingCombo[key]}"`;
                return `  ${key}: ${original} → ${actual}`;
              }).join("\n"),
              "warn"
            );
        }
    
        // Attempt to connect to the MongoDB server.
        client = new MongoClient();
        await client.connect(uri);
        log(`Connected to MongoDB! Database: "${databaseName}"`, "success");
        // Return the database object to interact with the specified database.
        return client.database(databaseName);
    } catch (error) {
        // If the connection fails, log the error message and reset the client to null.
        let errorMessage = `❌ Error connecting to database: "${databaseName}"`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        log(`❌ Error connecting to database:, ${errorMessage}`, "error");
        client = null;
        throw error;
    }
}

async function testAllMongoDBConnections() {
    for (const combo of combinations) {
      const uri = `mongodb://${combo.user}:${combo.password}@${combo.host}:${combo.port}/admin`;
      const client = new MongoClient();
  
      try {
        log(`Testing connection using uri: ${uri}`, "debug");
        await client.connect(uri);
        // log(`SUCCESS: Connected to MongoDB at "${uri}" using db "${combo.dbName}"`, "success");
        log(`SUCCESS: Connected to MongoDB!"`, "success");
        client.close(); // Don't forget to close the connection
        return combo; // Stop after first success
      } catch (error) {
        let errorMessage = `❌ Error in testAllMongoDBConnections`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        log(`❌ FAILED: Connection with ${JSON.stringify(combo)} \n ${JSON.stringify(errorMessage)}`, "debug");
        log(`ERROR while connecting to database: \n ${errorMessage}`, "warn");
      }
    }
  
    throw new Error("❌ No valid MongoDB URI found among tested combinations.");
}

  
// Perform a basic check to verify the connection to the MongoDB server.
export async function dbCheck() {
    try {
        // Connect to the "admin" database to perform the check.
        const db = await connectToMongoDB("admin");
        // Access the "admin" collection to ensure connectivity.
        await db.collection("admin");
        // Log a message indicating that the database check was successful.
        log("Database check completed successfully.", "success");
    } catch (error) {
        let errorMessage = `❌ Database check failed`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        log(`❌ Database check failed:", ${errorMessage}`);
    }
}


// Save JSON data to the specified collection with upsert option
export async function saveToCollection(data: Record<string, unknown>, collectionName: string) {
    try {
        const db = await connectToMongoDB(MONGODB_DB_NAME);
        const collection = db.collection(collectionName);

        if ("_id" in data) {
            // Use upsert: true to update or insert the document
            const _result = await collection.updateOne(
                { _id: data._id },  // Find document by its unique _id.
                { $set: data },      // Update the document with new data.
                { upsert: true }     // Enable upsert (update or insert).
            );
            // log(`✅ Data upserted to collection "${collectionName}":"${_result}"`);
            log(`✅ Data upserted to collection "${collectionName}", data._id: "${data._id}"`);
            // log(`${result}`);
        } else {
            // Regular insert if no _id field
            const insertResult = await collection.insertOne(data);
            log(`✅ Data saved to collection "${collectionName}", insertResult: "${insertResult}"`);
            // log(`${insertResult}`);
        }
    } catch (error) {
        let errorMessage = `Failed to save data to collection "${collectionName}".`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        log(`❌ Error saving to collection "${collectionName}":"${errorMessage}"`);
        throw new Error(errorMessage);
    }
}




/**
 * Validate device data before saving to the "devices" collection
 */
function isValidDeviceData(deviceInfo: Record<string, unknown>): boolean {
    return (
        typeof deviceInfo._id === "string" &&
        typeof deviceInfo.name === "string" &&
        typeof deviceInfo.description === "string" &&
        typeof deviceInfo.createdAt === "string"
    );
}

/**
 * Save device information to the "devices" collection
 */
export async function saveDeviceToDatabase(deviceInfo: Record<string, unknown>): Promise<void> {
    try {
        // Validate device data before saving
        if (!isValidDeviceData(deviceInfo)) {
            throw new Error("Invalid device data structure.");
        }
        await saveToCollection(deviceInfo, "devices");
        log(`✅ Device "${deviceInfo._id}" saved to "devices" collection`);
    } catch (error) {
        let errorMessage = "❌ Error saving device data:";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        log(`${errorMessage}`);
        throw new Error("Failed to save device data");
    }
}

/**
 * Validate sensor data before saving to the "sensors" collection
 */
function isValidSensorData(sensorInfo: Record<string, unknown>): boolean {
    return (
        typeof sensorInfo._id === "string" &&
        typeof sensorInfo.deviceId === "string" &&
        typeof sensorInfo.type === "string" &&
        typeof sensorInfo.description === "string" &&
        typeof sensorInfo.createdAt === "string"
    );
}

/**
 * Save sensor information to the "sensors" collection
 */
export async function saveSensorToDatabase(sensorInfo: Record<string, unknown>): Promise<void> {
    try {
        // Validate sensor data before saving
        if (!isValidSensorData(sensorInfo)) {
            throw new Error("Invalid sensor data structure.");
        }
        await saveToCollection(sensorInfo, "sensors");
        log(`✅ Sensor "${sensorInfo._id}" saved to "sensors" collection`);
    } catch (error) {
        let errorMessage = "❌ Error saving sensor data:";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        log(`${errorMessage}`);
        throw new Error("Failed to save sensor data");
    }
}

/**
 * Validate sensor data entry before saving to the "sensorData" collection
 */
function isValidSensorEntryData(sensorData: Record<string, unknown>): boolean {
    return (
        typeof sensorData.sensorId === "string" &&
        typeof sensorData.deviceId === "string" &&
        typeof sensorData.sessionId === "string" &&
        typeof sensorData.time === "string" &&
        typeof sensorData.timestamp === "string" &&
        typeof sensorData.values === "object" &&
        sensorData.values !== null
    );
}

/**
 * Save sensor data to the "sensorData" collection
 */
export async function saveSensorDataToDatabase(sensorData: Record<string, unknown>): Promise<void> {
    try {
        // Validate sensor data entry before saving
        if (!isValidSensorEntryData(sensorData)) {
            throw new Error("Invalid sensor data entry structure.");
        }
        await saveToCollection(sensorData, "sensorData");
        log(`✅ Sensor data saved to "sensorData" collection`);
    } catch (error) {
        let errorMessage = "❌ Error saving sensor data:";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        log(`${errorMessage}`);
        throw new Error("Failed to save sensor data");
    }
}



// function to disconnect from the MongoDB database.
export async function disconnectFromMongoDB() {
    // Check if a client connection exists before attempting to close it.
    if (client) {
        await client.close();  // Close the MongoDB connection.
        log("✅ Disconnected from MongoDB");
        client = null;  // Reset the client instance to null after disconnection.
    }
}

// Add a signal listener to gracefully handle shutdown
Deno.addSignalListener("SIGINT", async () => {
    log("🛑 Gracefully shutting down...");
    await disconnectFromMongoDB();  // Close the database connection
    log("✅ Database connection closed.");
    log("🚪 Exiting application.");
    Deno.exit();
});
