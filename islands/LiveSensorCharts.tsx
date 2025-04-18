// /islands/LiveSensorCharts.tsx

import { useEffect, useRef, useState } from "preact/hooks";
import Chart from "https://esm.sh/stable/chart.js@4.4.0/auto?target=es2022";

import { getSharedWebSocketClient } from "../utils/websocket.ts";
import { log } from "../utils/log.ts";

log(`Loaded: /islands/LiveSensorCharts.tsx`);

type SensorEntry = { time: number } & Record<string, unknown>;
type DeviceData = Record<string, Record<string, SensorEntry[]>>;
type SensorSelection = Record<string, string>; // key: `${deviceId}-${sensorName}`, value: selected field

export default function LiveSensorCharts() {
  const [devices, setDevices] = useState<DeviceData>({});
  const [status, setStatus] = useState("Connecting...");
  const [selectedFields, setSelectedFields] = useState<SensorSelection>({});
  const chartRefs = useRef<Record<string, Chart>>({});

  useEffect(() => {
    const ws = getSharedWebSocketClient();

    const unsubscribe = ws.subscribe((data) => {
      const body = data.body;

      if (
        typeof body?.deviceId === "string" &&
        Array.isArray(body.payload)
      ) {
        setDevices((prev) => {
          const updated = { ...prev };
          const { deviceId, payload } = body;

          if (!updated[deviceId]) updated[deviceId] = {};

          for (const sensor of payload) {
            const { name, time, values } = sensor;
            const sensorData = { time, ...values };

            if (!updated[deviceId][name]) updated[deviceId][name] = [];

            updated[deviceId][name].push(sensorData);
          }

          return updated;
        });
      }
    });

    const stopStatus = ws.onStatusChange(setStatus);

    return () => {
      unsubscribe();
      stopStatus();
    };
  }, []);

  // Update charts when devices or selectedFields change
  useEffect(() => {
    Object.entries(devices).forEach(([deviceId, sensors]) => {
      Object.entries(sensors).forEach(([sensorName, entries]) => {
        const canvasId = `${deviceId}-${sensorName}`;
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) return;

        const labels = entries.map((entry) =>
          new Date(Number(entry.time) / 1e6).toLocaleTimeString()
        );

        const selectedKey = selectedFields[canvasId] || Object.keys(entries[0] ?? {}).find(k => k !== "time");
        if (!selectedKey) return;

        const values = entries.map((entry) => Number(entry[selectedKey]));
        const datasetLabel = `${deviceId} - ${sensorName} (${selectedKey})`;

        if (chartRefs.current[canvasId]) {
          chartRefs.current[canvasId].data.labels = labels;
          chartRefs.current[canvasId].data.datasets[0].label = datasetLabel;
          chartRefs.current[canvasId].data.datasets[0].data = values;
          chartRefs.current[canvasId].update();
        } else {
          chartRefs.current[canvasId] = new Chart(canvas, {
            type: "line",
            data: {
              labels,
              datasets: [{
                label: datasetLabel,
                data: values,
                borderColor: "#4ADE80",
                backgroundColor: "rgba(74, 222, 128, 0.3)",
                fill: true,
                tension: 0.3,
              }],
            },
            options: {
              scales: {
                y: { beginAtZero: true },
              },
            },
          });
        }
      });
    });
  }, [devices, selectedFields]);

  return (
    <div>
      <h2 class="text-lg font-semibold mb-4">Connection Status: {status}</h2>
      {Object.entries(devices).map(([deviceId, sensors]) => (
        <div class="mb-10" key={deviceId}>
          <h3 class="text-xl mb-2">Device: {deviceId}</h3>
          {Object.entries(sensors).map(([sensorName, entries]) => {
            const canvasId = `${deviceId}-${sensorName}`;
            const fieldOptions = Object.keys(entries[0] ?? {}).filter((k) => k !== "time" && typeof entries[0][k] !== "string");
            const selectedKey = selectedFields[canvasId] || fieldOptions[0];

            return (
              <div class="mb-6" key={canvasId}>
                <h4 class="text-md mb-1">{sensorName}</h4>
                <label class="block text-sm mb-1">
                  Select field to display:
                  <select
                    class="ml-2 px-2 py-1 border rounded"
                    value={selectedKey}
                    onChange={(e) =>
                      setSelectedFields((prev) => ({
                        ...prev,
                        [canvasId]: (e.target as HTMLSelectElement).value,
                      }))
                    }
                  >
                    {fieldOptions.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </label>
                <canvas id={canvasId} height="150" />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
