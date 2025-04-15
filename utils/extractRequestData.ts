// /utils/extractRequestData.ts

import { log } from "./log.ts";


log(`Loaded: /utils/extractRequestData.ts`);

// Function to extract known properties from the Request object
export async function extractRequestData(req: Request): Promise<Record<string, unknown>> {
    const knownProperties = [
        "method", "url", "headers", "body", "bodyUsed", "cache", "credentials",
        "destination", "integrity", "keepalive", "mode", "redirect",
        "referrer", "referrerPolicy", "signal", "clone"
    ];
  
    const requestData: Record<string, unknown> = {};
  
    for (const prop of knownProperties) {
        try {
            // Handle headers separately as they need to be converted to an object
            if (prop === "headers") {
                requestData[prop] = Object.fromEntries(req.headers.entries());
            } else if (prop === "body") {
                // Only read the body if it hasn't been used
                if (!req.bodyUsed) {
                  const bodyText = await req.text();
                  try {
                      // Try to parse the body as JSON
                      requestData[prop] = JSON.parse(bodyText);
                  } catch {
                      // If parsing fails, save the raw text
                      requestData[prop] = bodyText;
                  }
                } else {
                    requestData[prop] = "Body already consumed";
                }
            } else if (prop === "signal") {
                // Signal is a complex object, so store its state instead
                requestData[prop] = req.signal.aborted ? "aborted" : "active";
            } else if (typeof (req as any)[prop] !== "function") {
                // Get the property value if it's not a function
                requestData[prop] = (req as any)[prop];
            }
        } catch (error) {
          let errorMessage = "❌ Error saving HTTP request data:";
          if (error instanceof Error) {
            errorMessage = error.message;
          }
            requestData[prop] = `Error retrieving property: ${errorMessage}`;
        }
    }
  
    return requestData;
}
