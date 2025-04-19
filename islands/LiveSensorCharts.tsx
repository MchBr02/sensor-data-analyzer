// /islands/LiveSensorCharts.tsx

import { useEffect, useState } from "preact/hooks";

import { getSharedWebSocketClient } from "../utils/websocket.ts";
import SensorCharts from "../components/SensorCharts.tsx";
import { log } from "../utils/log.ts";

log(`Loaded: /islands/LiveSensorCharts.tsx`);

// Define expected data structures
type SensorEntry = { time: number } & Record<string, unknown>;
type DeviceData = Record<string, Record<string, SensorEntry[]>>;
type SensorSelection = Record<string, string>; // key: `${deviceId}-${sensorName}`, value: selected field

export default function LiveSensorCharts() {
  // State: nested object storing all sensor data by device and sensor
  const [devices, setDevices] = useState<DeviceData>({});
  // Connection status text
  const [status, setStatus] = useState("Connecting...");
  // Stores which field is selected to display per sensor
  const [selectedFields, setSelectedFields] = useState<SensorSelection>({});
  // Stores Chart.js instances per canvas ID to avoid reinitializing them

  // Effect: WebSocket connection and data handling
  useEffect(() => {
    const ws = getSharedWebSocketClient();

    // Handle incoming WebSocket data
    const unsubscribe = ws.subscribe((data) => {
      const body = data.body;

      // Ensure payload is in expected format
      if (
        typeof body?.deviceId === "string" &&
        Array.isArray(body.payload)
      ) {
        setDevices((prev) => {
          const updated = { ...prev };
          const { deviceId, payload } = body;

          // Initialize device entry if missing
          if (!updated[deviceId]) updated[deviceId] = {};

          // Process each sensor reading
          for (const sensor of payload) {
            const { name, time, values } = sensor;
            const sensorData = { time, ...values };

            // Initialize sensor entry if missing
            if (!updated[deviceId][name]) updated[deviceId][name] = [];

            // Append new reading
            updated[deviceId][name].push(sensorData);
          }

          return updated;
        });
      }
    });

    // Monitor connection status
    const stopStatus = ws.onStatusChange(setStatus);

    // Cleanup on unmount
    return () => {
      unsubscribe();
      stopStatus();
    };
  }, []);

  // Render UI
  return (
    <div>
      <h2 class="text-lg font-semibold mb-4">Connection Status: {status}</h2>

      {/* Render charts for each device and sensor */}
      {Object.entries(devices).map(([deviceId, sensors]) => (
        <SensorCharts
        key={deviceId}
        deviceId={deviceId}
        sensors={sensors}
        selectedFields={selectedFields}
        onFieldChange={(canvasId, newValue) =>
          setSelectedFields((prev) => ({
            ...prev,
            [canvasId]: newValue,
          }))
        }
      />
      ))}
    </div>
  );
}
