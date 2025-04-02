// utils/sensorDataHandler.ts

import { ensureDir } from "https://deno.land/std/fs/mod.ts";

import { saveToCollection } from "./database.ts";

const dataFolder = "./data";

// Ensure the data folder exists
await ensureDir(dataFolder);



/**
 * Utility function to safely extract the body from requestData
 */
const getRequestBody = (requestData: Record<string, unknown>): Record<string, unknown> => {
  if (
      requestData.body &&
      typeof requestData.body === "object" &&
      requestData.body !== null
  ) {
      return requestData.body as Record<string, unknown>;
  }
  throw new Error("Invalid or missing request body");
};



/**
 * Save HTTP request data as a separate sensor entry in the sensorData collection
 */
async function saveHttpRequestDataToDatabase(requestData: Record<string, unknown>): Promise<void> {
  try {
    const body = getRequestBody(requestData);

    const deviceId = body.deviceId as string;
    const sessionId = body.sessionId as string;

    // Collect all headers into a key-value pair object
    const headers = requestData.headers as Record<string, string>;

    // Prepare the HTTP sensor data object
    const httpReqData = {
      sensorId: "http-request-data",
      deviceId: deviceId,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      values: headers,
    };

    // Save the HTTP request data as a separate sensor entry
    await saveToCollection(httpReqData, "sensorData");
    console.log(`✅ HTTP request data saved to "sensorData" collection:`, httpReqData);
  } catch (error) {
    let errorMessage = "❌ Error saving HTTP request data:";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error(errorMessage);
    throw new Error("Failed to save HTTP request data");
  }
}



/**
 * Save data to the correct collections based on the data structure
 */
async function saveDataToDatabase(requestData: Record<string, unknown>): Promise<void> {
  try {
    const body = getRequestBody(requestData);

    // Validate the basic structure
    if (
        "deviceId" in body &&
        typeof body.deviceId === "string" &&
        "sessionId" in body &&
        typeof body.sessionId === "string" &&
        Array.isArray(body.payload)
    ) {
          const body = requestData.body as any;

          // Save the device information in the "devices" collection
          const deviceInfo = {
              _id: body.deviceId,
              name: body.deviceName || "Unknown Device",
              description: body.deviceDescription || "No description",
              createdAt: new Date().toISOString(),
          };
          await saveToCollection(deviceInfo, "devices");
          console.log(`✅ Device "${body.deviceId}" saved to "devices" collection`);

          // Save HTTP request data as a separate sensorData entry
          await saveHttpRequestDataToDatabase(requestData);

          for (const item of body.payload) {
              if (
                  item &&
                  typeof item === "object" &&
                  "name" in item &&
                  typeof item.name === "string" &&
                  item.name.trim() !== "" &&
                  "values" in item &&
                  typeof item.values === "object" &&
                  Object.keys(item.values).length > 0
              ) {
                  // Save the sensor information in the "sensors" collection
                  const sensorId = `${body.deviceId}-${item.name}`;
                  const sensorInfo = {
                      _id: sensorId,
                      deviceId: body.deviceId,
                      type: item.name,
                      description: `Sensor of type ${item.name} on device ${body.deviceId}`,
                      createdAt: new Date().toISOString(),
                  };
                  await saveToCollection(sensorInfo, "sensors");
                  console.log(`✅ Sensor "${sensorId}" saved to "sensors" collection`);

                  // Save the sensor data in the "sensorData" collection, including sessionId
                  const sensorData = {
                      sensorId: sensorId,
                      deviceId: body.deviceId,
                      sessionId: body.sessionId,
                      timestamp: new Date().toISOString(),
                      values: item.values,
                  };
                  await saveToCollection(sensorData, "sensorData");
                  console.log(`✅ Sensor data saved to "sensorData" collection:`, sensorData);
              } else {
                  console.warn("❌ Invalid or empty payload:", item);
              }
          }
      } else {
          console.warn("❌ Invalid data format:", requestData.body);
      }
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
 * Main function to handle and save the data from the request
 */
export async function RequestDataHandler(requestData: Record<string, unknown>): Promise<Response> {
  try {
      // const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      if (requestData.method === "POST") {
          await saveDataToDatabase(requestData);
          console.log("✅ Request data handled successfully");
          return new Response("✅ Request data handled successfully", { status: 200 });
      } else if (requestData.method === "GET") {
          return new Response("✅ Render data page", { status: 200 });
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