// utils/database.ts

import { MongoClient } from "https://deno.land/x/mongo/mod.ts";
import "@std/dotenv/load";


const MONGODB_ADMIN_USER = Deno.env.get("MONGODB_ADMIN_USER") || "admin";
const MONGODB_ADMIN_PASS = Deno.env.get("MONGODB_ADMIN_PASS") || "password";
const MONGODB_HOST_ADRESS = Deno.env.get("MONGODB_HOST_ADRESS") || "localhost";
const MONGODB_HOST_PORT = Deno.env.get("MONGODB_HOST_PORT") || "27017";
const MONGODB_DB_NAME = Deno.env.get("MONGODB_DB_NAME") || "sensordb";

const MONGODB_URI = `mongodb://${ MONGODB_ADMIN_USER }:${ MONGODB_ADMIN_PASS }@${ MONGODB_HOST_ADRESS }:${ MONGODB_HOST_PORT }/admin`;

// console.log(`MONGODB_URI: "${MONGODB_URI}"`);

async function connectToMongoDB(databaseName: string) {
    const client = new MongoClient();
    try {
        // console.log(`Connecting to MongoDB at "${MONGODB_URI}"`);
        await client.connect(MONGODB_URI);
        const db = client.database(databaseName);
        // const pingResult = JSON.stringify(await db.runCommand({ ping: 1 }), null, 2);
        // console.log(`Database connection successful!,`);
        // console.log(`MONGODB_URI: "${MONGODB_URI}",`); // <- PASSWORD HERE :(
        // console.log(`pingResult: "${pingResult}"`);
        return db;
    } catch (error) {
        let errorMessage = "Failed to do something exceptional";
        if (error instanceof Error) { errorMessage = error.message; }
        console.error("Error connecting to database:", errorMessage);
        throw new Error(errorMessage);
    }
}


// Save JSON data to the specified collection with upsert option
export async function saveToCollection(data: Record<string, unknown>, collectionName: string) {
    try {
        const db = await connectToMongoDB(MONGODB_DB_NAME);
        const collection = db.collection(collectionName);

        if ("_id" in data) {
            // Use upsert: true to update or insert the document
            const result = await collection.updateOne(
                { _id: data._id },
                { $set: data },
                { upsert: true }
            );
            console.log(`✅ Data upserted to collection "${collectionName}":`, result);
        } else {
            // Regular insert if no _id field
            const insertResult = await collection.insertOne(data);
            console.log(`✅ Data saved to collection "${collectionName}":`, insertResult);
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

export async function dbCheck() {
    try {
        const db = await connectToMongoDB("admin");
        await db.collection("admin")
        // const db = await accessDatabase(client);
        // await createCollection(db, "sensorData");
        console.log("✅ All database checks completed successfully.");
    } catch (error) {
        console.error("❌ Database check failed:", error);
    }
}


/*
// Save JSON data to the specified collection
export async function saveToCollection(data: Record<string, unknown>, collectionName: string) {
    try {
        const db = await connectToMongoDB(MONGODB_DB_NAME);
        // const collection = await createCollection(db, collectionName);
        const collection = db.collection(collectionName);
        const insertResult = await collection.insertOne(data);
        console.log(`✅ Data saved to collection "${collectionName}":`, insertResult);
    } catch (error) {
        let errorMessage = `Failed to create or access collection "${collectionName}".`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(`❌ Error saving to collection "${collectionName}":`, errorMessage);
        throw new Error(`Failed to save data to collection "${collectionName}"`);
    }
}
*/



/*
async function accessDatabase(client: MongoClient) { // MongoDB creates databases automatically when you start using them
    try {
        const db = client.database(MONGODB_DB_NAME);
        console.log(`Database "${MONGODB_DB_NAME}" accessed or created.`);
        return db; // Return the database object
    } catch (error) {
        let errorMessage = `Failed to create or access database "${MONGODB_DB_NAME}".`;
        if (error instanceof Error) {
        errorMessage = error.message;
        }
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}
*/

/*
async function createCollection(db: any, collectionName: string) { // MongoDB creates collections automatically when you insert data.
    try {
        const collection = db.collection(collectionName);
        console.log(`Collection "${collectionName}" accessed or created.`);
        return collection; // Return the collection object
    } catch (error) {
        let errorMessage = `Failed to create or access collection "${collectionName}".`;
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}
*/