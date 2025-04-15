// /utils/websocket.ts

import { log } from "./log.ts";

log(`Loaded: /utils/websocket.ts`);

export class WebSocketManager {
    private clients: Set<WebSocket>;
    private isBroadcasting: boolean;

    constructor() {
        this.clients = new Set();
        this.isBroadcasting = false;
    }

    addClient(socket: WebSocket) {
        this.clients.add(socket);
        log(`🌐 Client added. Total clients: "${this.clients.size}"`);
    }

    removeClient(socket: WebSocket) {
        this.clients.delete(socket);
        log(`❌ Client removed. Total clients: "${this.clients.size}"`);
    }

    broadcast(data: any) {
        const message = JSON.stringify(data);
        log(`🚀 Broadcasting data: "${message}"`);
        this.clients.forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
                try {
                    socket.send(message);
                    log("📤 Broadcasted data to client");
                } catch (error) {
                    log(`❌ Error broadcasting to client: "${error}"`, "error");
                }
            }
        });
    }

    handleConnection(socket: WebSocket) {
        this.addClient(socket);

        socket.onmessage = (event) => {
            log(`🔧 Message from client: "${event.data}`);
        };

        socket.onclose = () => {
            this.removeClient(socket);
            log("❌ WebSocket connection closed");
        };

        socket.onerror = (err) => {
            log(`(handleConnection) WebSocket error: "${err}"`, "error");
            this.removeClient(socket);
        };
    }

    startBroadcastingTime() {
        const intervalId = setInterval(() => {
            if (!this.isBroadcasting) {
                clearInterval(intervalId);
                log("🛑 Broadcasting stopped.");
                return;
            }

            const currentTime = new Date().toLocaleTimeString();
            log(`⏰ Broadcasting current time: "${currentTime}"`);
            this.broadcast({ time: currentTime });
        }, 1000);
    }
}