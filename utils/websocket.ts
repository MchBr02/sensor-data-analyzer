// ./utils/websocket.ts

export class WebSocketManager {
    private clients: Set<WebSocket>;
    private isBroadcasting: boolean;

    constructor() {
        this.clients = new Set();
        this.isBroadcasting = false;
    }

    addClient(socket: WebSocket) {
        this.clients.add(socket);
        console.log("🌐 Client added. Total clients:", this.clients.size);
    }

    removeClient(socket: WebSocket) {
        this.clients.delete(socket);
        console.log("❌ Client removed. Total clients:", this.clients.size);
    }

    broadcast(data: any) {
        const message = JSON.stringify(data);
        console.log("🚀 Broadcasting data:", message);
        this.clients.forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
                try {
                    socket.send(message);
                    console.log("📤 Broadcasted data to client");
                } catch (error) {
                    console.error("❌ Error broadcasting to client:", error);
                }
            }
        });
    }

    handleConnection(socket: WebSocket) {
        this.addClient(socket);

        socket.onmessage = (event) => {
            console.log("🔧 Message from client:", event.data);
        };

        socket.onclose = () => {
            this.removeClient(socket);
            console.log("❌ WebSocket connection closed");
        };

        socket.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
            this.removeClient(socket);
        };
    }

    startBroadcastingTime() {
        const intervalId = setInterval(() => {
            if (!this.isBroadcasting) {
                clearInterval(intervalId);
                console.log("🛑 Broadcasting stopped.");
                return;
            }

            const currentTime = new Date().toLocaleTimeString();
            console.log("⏰ Broadcasting current time:", currentTime);
            this.broadcast({ time: currentTime });
        }, 1000);
    }
}