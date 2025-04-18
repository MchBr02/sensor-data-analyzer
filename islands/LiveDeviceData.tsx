// /islands/LiveDeviceData.tsx

import { useEffect, useState } from "preact/hooks";
import { getSharedWebSocketClient } from "../utils/websocket.ts";
import { validateBasicStructure } from "../utils/validDataStructure.ts";
import { log } from "../utils/log.ts";

log(`Loaded: /islands/LiveDeviceData.tsx`);

type SensorEntry = { time: number } & Record<string, unknown>;
type DeviceData = Record<string, Record<string, SensorEntry[]>>;

export default function LiveDeviceData() {
  const [devices, setDevices] = useState<DeviceData>({});
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    const ws = getSharedWebSocketClient();

    const unsubscribe = ws.subscribe((data) => {
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
    });

    const stopStatusUpdates = ws.onStatusChange(setConnectionStatus);

    return () => {
      unsubscribe();
      stopStatusUpdates();
    };
  }, []);

  return (
    <div>
      <h2>Status: {connectionStatus}</h2>
      <pre>{JSON.stringify(devices, null, 2)}</pre>
    </div>
  );
}
