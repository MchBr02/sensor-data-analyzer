// /utils/sensorDataHandler.ts

import { saveToCollection } from "./database.ts";
import { saveDeviceToDatabase, saveSensorToDatabase, saveSensorDataToDatabase } from "./database.ts";
import { log } from "./log.ts";
import { validateBasicStructure, isValidPayloadItem } from "./validDataStructure.ts";

log(`Loaded: /utils/sensorDataHandler.ts`);

let latestRequestData: Record<string, unknown> | null = null;


/**
* Get the latest request data
*/
export function getLatestRequestData(): Record<string, unknown> | null {
    return latestRequestData;
}  


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
 * Save data to the correct collections based on the data structure
 */
async function saveDataToDatabase(requestData: Record<string, unknown>): Promise<void> {
    try {
        // Save raw request data for future analysis
        await saveToCollection(requestData, "requestData");
        log("Raw request data saved to 'requestData' collection.");

        // Validate the request body before proceeding
        if (!validateBasicStructure(requestData)) {
            throw new Error("Invalid data structure.");
        }

        // Directly assign the body from requestData after validation
        const body = requestData.body as Record<string, unknown>;
        const payload = body.payload as Array<Record<string, unknown>>;

        // Prepare device information
        const deviceInfo = {
            _id: body.deviceId,
            name: body.deviceName || "Unknown Device",
            description: body.deviceDescription || "No description",
            createdAt: new Date().toISOString(),
        };
        await saveDeviceToDatabase(deviceInfo);
        log(`Device "${body.deviceId}" saved to "devices" collection`);

        for (const item of payload) {
            if (!isValidPayloadItem(item)) {
                log(`Invalid payload item: ${JSON.stringify(item)}`);
                continue;
            }

            const sensorId = `${body.deviceId}-${item.name}`;
            const sensorInfo = {
                _id: sensorId,
                deviceId: body.deviceId,
                type: item.name,
                description: `Sensor of type ${item.name} on device ${body.deviceId}`,
                createdAt: new Date().toISOString(),
            };
            await saveSensorToDatabase(sensorInfo);
            log(`Sensor "${sensorId}" saved to "sensors" collection`);

            // Access the time field correctly within each item
            const timeValue = item.time ? String(item.time) : "No time provided";

            const sensorData = {
                sensorId: sensorId,
                deviceId: body.deviceId,
                sessionId: body.sessionId,
                time: timeValue,
                timestamp: new Date().toISOString(),
                values: item.values,
            };
            await saveSensorDataToDatabase(sensorData);
            log(`Sensor data for "${sensorId}" saved to "sensorData" collection`);
        }
    } catch (error) {
        let errorMessage = "Error handling request data:";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        log(`Saving JSON data failed: ${errorMessage}`);
        throw new Error("Failed to handle JSON data");
    }
}