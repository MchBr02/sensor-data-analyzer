// ./islands/LiveRequestData.tsx

import { useEffect, useState } from "preact/hooks";

export default function LiveData() {
    const [data, setData] = useState({});
    const [connectionStatus, setConnectionStatus] = useState("Connecting...");
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        let socket: WebSocket;

        function connectWebSocket() {
            const host = globalThis.location.host;
            const socketUrl = `ws://${host}/api/data`;
            console.log("🔗 Connecting to WebSocket at:", socketUrl);

            socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                setConnectionStatus("Connected");
                console.log("✅ WebSocket connection established");
            };

            socket.onmessage = (event) => {
                try {
                    console.log("📥 Raw WebSocket message received:", event.data);
                    const receivedData = JSON.parse(event.data);
                    if (receivedData.time) {
                        setCurrentTime(receivedData.time);
                        console.log("⏰ Received time update:", receivedData.time);
                    } else {
                        setData((prevData) => ({ ...prevData, ...receivedData }));
                    }
                    console.log("📥 Received new data:", receivedData);
                } catch (error) {
                    console.error("❌ Failed to parse WebSocket message:", error);
                }
            };

            socket.onclose = () => {
                setConnectionStatus("Disconnected");
                console.log("❌ WebSocket connection closed. Attempting to reconnect...");
                setTimeout(connectWebSocket, 1000);
            };

            socket.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
                socket.close();
            };
        }

        connectWebSocket();

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    return (
        <div>
            <h2>Connection Status: {connectionStatus}, Time: {currentTime}</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
