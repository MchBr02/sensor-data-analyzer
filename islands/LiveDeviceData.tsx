// /islands/LiveDeviceData.tsx

import { useEffect, useState } from "preact/hooks";

import { validateBasicStructure } from "../utils/validDataStructure.ts";
import { log } from "../utils/log.ts";

log(`Loaded: /islands/LiveDeviceData.tsx`);

type SensorEntry = { time: number } & Record<string, unknown>;
type DeviceData = Record<string, Record<string, SensorEntry[]>>;

export default function LiveDeviceData() {
  const [devices, setDevices] = useState<DeviceData>({});
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    let socket: WebSocket;

    function connectWebSocket() {
      const host = globalThis.location.host;
      const socketUrl = `ws://${host}/api/data`;
      socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        setConnectionStatus("Connected");
        console.log("✅ WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!validateBasicStructure(data)) return;

          const { deviceId, payload } = data.body;

          setDevices((prevDevices) => {
            const updated = { ...prevDevices };

            if (!updated[deviceId]) {
              updated[deviceId] = {};
            }

            payload.forEach(({ name, time, values }: any) => {
              if (!updated[deviceId][name]) {
                updated[deviceId][name] = [];
              }

              updated[deviceId][name].push({
                time,
                ...values,
              });
            });

            return updated;
          });
        } catch (err) {
          console.error("❌ Error parsing WebSocket message", err);
        }
      };

      socket.onclose = () => {
        setConnectionStatus("Disconnected");
        console.log("❌ WebSocket closed, reconnecting...");
        setTimeout(connectWebSocket, 1000);
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket error", err);
        socket.close();
      };
    }

    connectWebSocket();

    return () => socket?.close();
  }, []);

  return (
    <div>
      <h2>Status: {connectionStatus}</h2>
      <pre>{JSON.stringify(devices, null, 2)}</pre>
    </div>
  );
}
