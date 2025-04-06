// utils/sensorDataHandler.ts

import { ensureDir } from "https://deno.land/std/fs/mod.ts";

import { saveToCollection } from "./database.ts";
import { saveDeviceToDatabase, saveSensorToDatabase, saveSensorDataToDatabase } from "./database.ts";

let latestRequestData: Record<string, unknown> | null = null;

const dataFolder = "./data";
// Ensure the data folder exists
await ensureDir(dataFolder);


/**
 * Main function to handle and save the data from the request
 */
export async function RequestDataHandler(requestData: Record<string, unknown>): Promise<Response> {
  try {
      if (requestData.method === "POST") {
          // Save data to the database
          await saveDataToDatabase(requestData);
          // Update the latest request data for real-time display
          latestRequestData = requestData;
          console.log("✅ Request data handled successfully");
          return new Response("✅ Request data handled successfully", { status: 200 });
      } else if (requestData.method === "GET") {
          return new Response(JSON.stringify(latestRequestData), { status: 200 });
      } else {
          return new Response("Method Not Allowed", { status: 405 });
      }
  } catch (error) {
      let errorMessage = "❌ Error handling request data:";
      if (error instanceof Error) {
          errorMessage = error.message;
      }
      console.error(errorMessage);
      return new Response("❌ Failed to process the request data: " + errorMessage, { status: 500 });
  }
}



/**
 * Utility function to validate the basic structure of the requestData
 */
const validateBasicStructure = (requestData: Record<string, unknown>): boolean => {
    return (
        typeof requestData.body === "object" &&
        requestData.body !== null &&
        "deviceId" in requestData.body &&
        typeof requestData.body.deviceId === "string" &&
        "sessionId" in requestData.body &&
        typeof requestData.body.sessionId === "string" &&
        "payload" in requestData.body &&
        Array.isArray(requestData.body.payload) &&
        requestData.body.payload.every(item => typeof item === "object" && item !== null)
    );
};

/**
 * Save data to the correct collections based on the data structure
 */
async function saveDataToDatabase(requestData: Record<string, unknown>): Promise<void> {
  try {
    // Validate the request body before proceeding
    if (!validateBasicStructure(requestData)) {
        throw new Error("Invalid data structure.");
    }

    // Directly assign the body from requestData after validation
    const body = requestData.body as Record<string, unknown>;

    // Type assertion for payload to ensure it is an array of objects
    const payload = body.payload as Array<Record<string, unknown>>;
    

    // Prepare device information
    const deviceInfo = {
        _id: body.deviceId,
        name: body.deviceName || "Unknown Device",
        description: body.deviceDescription || "No description",
        createdAt: new Date().toISOString(),
    };
    // Save the device information in the "devices" collection
    await saveDeviceToDatabase(deviceInfo);
    console.log(`✅ Device "${body.deviceId}" saved to "devices" collection`);

        for (const item of payload) {
            const sensorId = `${body.deviceId}-${item.name}`;
            const sensorInfo = {
                _id: sensorId,
                deviceId: body.deviceId,
                type: item.name,
                description: `Sensor of type ${item.name} on device ${body.deviceId}`,
                createdAt: new Date().toISOString(),
            };
            // Save the sensor information in the "sensors" collection
            await saveSensorToDatabase(sensorInfo);
            console.log(`✅ Sensor "${sensorId}" saved to "sensors" collection`);

            // Access the time field correctly within each item
            const timeValue = item.time ? String(item.time) : "No time provided";

            // Save the sensor data in the "sensorData" collection, including sessionId
            const sensorData = {
                sensorId: sensorId,
                deviceId: body.deviceId,
                sessionId: body.sessionId,
                time: timeValue || "No time provided",
                timestamp: new Date().toISOString(),
                values: item.values
            };
            // Save the sensor data in the "sensorData" collection
            await saveSensorDataToDatabase(sensorData);
            console.log(`✅ Sensor data saved to "sensorData" collection`);
        }

    
        // // Collect all headers into a key-value pair object
        // const headers = requestData.headers as Record<string, string>;

        // // Prepare the HTTP sensor data object
        // const httpReqData = {
        // sensorId: "request-headers-data",
        // deviceId: body.deviceId,
        // sessionId: body.sessionId,
        // timestamp: new Date().toISOString(),
        // values: headers,
        // };
        // await saveSensorDataToDatabase(httpReqData);
        // console.log(`✅ Request data saved to "sensorData" collection`);

  } catch (error) {
      let errorMessage = "❌ Error handling request data:";
      if (error instanceof Error) {
          errorMessage = error.message;
      }
      console.error("❌ Error saving JSON data:", errorMessage);
      throw new Error("Failed to handle JSON data");
  }
}

/**
* Get the latest request data
*/
export function getLatestRequestData(): Record<string, unknown> | null {
  return latestRequestData;
}
