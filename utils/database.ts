// utils/database.ts

import { MongoClient } from "https://deno.land/x/mongo/mod.ts";
import "@std/dotenv/load";


const MONGODB_ADMIN_USER = Deno.env.get("MONGODB_ADMIN_USER") || "user";
const MONGODB_ADMIN_PASS = Deno.env.get("MONGODB_ADMIN_PASS") || "password";
const MONGODB_HOST_ADRESS = Deno.env.get("MONGODB_HOST_ADRESS") || "localhost";
const MONGODB_HOST_PORT = Deno.env.get("MONGODB_HOST_PORT") || "27017";
const MONGODB_DB_NAME = Deno.env.get("MONGODB_DB_NAME") || "sensordb";

const MONGODB_URI = `mongodb://${ MONGODB_ADMIN_USER }:${ MONGODB_ADMIN_PASS }@${ MONGODB_HOST_ADRESS }:${ MONGODB_HOST_PORT }/admin`;

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
        // Attempt to connect to the MongoDB server.
        await client.connect(MONGODB_URI);
        console.log(`✅ Connected to MongoDB! Database: "${databaseName}"`);
        // Return the database object to interact with the specified database.
        return client.database(databaseName);
    } catch (error) {
        // If the connection fails, log the error message and reset the client to null.
        let errorMessage = `❌ Error connecting to database: "${databaseName}"`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("❌ Error connecting to database:", errorMessage);
        client = null;
        throw error;
    }
}

  
// Perform a basic check to verify the connection to the MongoDB server.
export async function dbCheck() {
    try {
        // Connect to the "admin" database to perform the check.
        const db = await connectToMongoDB("admin");
        // Access the "admin" collection to ensure connectivity.
        await db.collection("admin");
        // Log a message indicating that the database check was successful.
        console.log("✅ Database check completed successfully.");
    } catch (error) {
        let errorMessage = `❌ Database check failed`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("❌ Database check failed:", errorMessage);
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
            // console.log(`✅ Data upserted to collection "${collectionName}":`, _result);
            console.log(`✅ Data upserted to collection "${collectionName}", data._id: "${data._id}"`);
            // console.log(`${result}`);
        } else {
            // Regular insert if no _id field
            const insertResult = await collection.insertOne(data);
            console.log(`✅ Data saved to collection "${collectionName}", insertResult: "${insertResult}"`);
            // console.log(`${insertResult}`);
        }
    } catch (error) {
        let errorMessage = `Failed to save data to collection "${collectionName}".`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(`❌ Error saving to collection "${collectionName}":`, errorMessage);
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
        console.log(`✅ Device "${deviceInfo._id}" saved to "devices" collection`);
    } catch (error) {
        let errorMessage = "❌ Error saving device data:";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(errorMessage);
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
        console.log(`✅ Sensor "${sensorInfo._id}" saved to "sensors" collection`);
    } catch (error) {
        let errorMessage = "❌ Error saving sensor data:";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(errorMessage);
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
        console.log(`✅ Sensor data saved to "sensorData" collection`);
    } catch (error) {
        let errorMessage = "❌ Error saving sensor data:";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(errorMessage);
        throw new Error("Failed to save sensor data");
    }
}













// function to disconnect from the MongoDB database.
export async function disconnectFromMongoDB() {
    // Check if a client connection exists before attempting to close it.
    if (client) {
        await client.close();  // Close the MongoDB connection.
        console.log("✅ Disconnected from MongoDB");
        client = null;  // Reset the client instance to null after disconnection.
    }
}



// Add a signal listener to gracefully handle shutdown
Deno.addSignalListener("SIGINT", async () => {
    console.log("🛑 Gracefully shutting down...");
    await disconnectFromMongoDB();  // Close the database connection
    console.log("✅ Database connection closed.");
    console.log("🚪 Exiting application.");
    Deno.exit();
});
