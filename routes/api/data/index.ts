// /routes/api/data/index.ts

import { extractRequestData } from "../../../utils/extractRequestData.ts";
import { RequestDataHandler, getLatestRequestData } from "../../../utils/requestDataHandler.ts";
import { WebSocketManager } from "../../../utils/websocket.ts";
import { log } from "../../../utils/log.ts";

log(`Loaded: /routes/api/data/index.ts`);

const wsManager = new WebSocketManager();

export async function handler(req: Request): Promise<Response> {
    try {

        // Handle WebSocket upgrade requests from HTTP clients.
        if (req.headers.get("upgrade") === "websocket") {
            const { socket, response } = Deno.upgradeWebSocket(req);
            wsManager.handleConnection(socket);

            // When the WebSocket connection is established
            socket.onopen = () => {
                log("🌐 WebSocket connection established");
                const latestData = getLatestRequestData();
                if (latestData) {
                    socket.send(JSON.stringify(latestData));
                }
            };
            return response;
        }

        // Handle POST request to receive sensor data
        if (req.method === "POST") {
            const requestData = await extractRequestData(req);
            console.log("📦 Request Data Extracted");
            // console.log(`${requestData}`);
            await RequestDataHandler(requestData);
            wsManager.broadcast(requestData);
            return new Response("✅ (POST)Request data handled successfully");
        } 
        // Handle GET request to retrieve the latest data
        else if (req.method === "GET") {
            const latestData = getLatestRequestData();
            return new Response(JSON.stringify(latestData), {
                headers: { "Content-Type": "application/json" },
            });
        } else {
            return new Response("Method Not Allowed", { status: 405 });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Error handling request data:", errorMessage);
        return new Response("❌ Failed to process the request data", { status: 500 });
    }
}
