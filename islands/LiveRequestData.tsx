import { useEffect, useState } from "preact/hooks";

export default function LiveData() {
    const [data, setData] = useState({});
    const [connectionStatus, setConnectionStatus] = useState("Connecting...");

    useEffect(() => {
        let socket: WebSocket;

        function connectWebSocket() {
            // Use the window location to dynamically get the correct IP address
            const host = window.location.host;
            const socketUrl = `ws://${host}/api/data`;
            console.log("🔗 Connecting to WebSocket at:", socketUrl);

            socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                setConnectionStatus("Connected");
                console.log("✅ WebSocket connection established");
            };

            socket.onmessage = (event) => {
                const receivedData = JSON.parse(event.data);
                setData(receivedData);
                console.log("📥 Received new data:", receivedData);
            };

            socket.onclose = () => {
                setConnectionStatus("Disconnected");
                console.log("❌ WebSocket connection closed. Attempting to reconnect...");
                setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
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
            <h2>Connection Status: {connectionStatus}</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
