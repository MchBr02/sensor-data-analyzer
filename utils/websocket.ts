// /utils/websocket.ts

import { log } from "./log.ts";

log(`Loaded: /utils/websocket.ts`);
type Callback = (data: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private subscribers = new Set<Callback>();
  private statusListeners = new Set<(status: string) => void>();

  constructor() {
    this.connect();
  }

  private connect() {
    const host = globalThis.location?.host;
    if (!host) {
      console.warn("🌐 WebSocketClient: Skipping connection — not in browser");
      return;
    }

    const socketUrl = `ws://${host}/api/data`;
    this.socket = new WebSocket(socketUrl);

    this.socket.onopen = () => {
      this.broadcastStatus("Connected");
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.subscribers.forEach((cb) => cb(data));
      } catch (e) {
        console.error("WebSocket parse error:", e);
      }
    };

    this.socket.onclose = () => {
      this.broadcastStatus("Disconnected");
      setTimeout(() => this.connect(), 1000);
    };

    this.socket.onerror = (e) => {
      console.error("WebSocket error:", e);
      this.socket?.close();
    };
  }

  private broadcastStatus(status: string) {
    this.statusListeners.forEach((cb) => cb(status));
  }

  subscribe(callback: Callback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  onStatusChange(callback: (status: string) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }
}

let client: WebSocketClient | null = null;

export function getSharedWebSocketClient(): WebSocketClient {
  if (!client) {
    client = new WebSocketClient();
  }
  return client;
}


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
        log(`🔌 Client removed. Total clients: "${this.clients.size}"`);
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
            log("🔌 WebSocket connection closed");
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