import { useEffect, useRef, useState } from "preact/hooks";

import Chart from "https://esm.sh/stable/chart.js@4.4.0/auto?target=es2022";

type SensorEntry = { time: number } & Record<string, unknown>;
type DeviceData = Record<string, Record<string, SensorEntry[]>>;

export default function LiveSensorCharts() {
  const [devices, setDevices] = useState<DeviceData>({});
  const [status, setStatus] = useState("Connecting...");
  const chartRefs = useRef<Record<string, Chart>>({});

  useEffect(() => {
    const host = globalThis.location.host;
    const socket = new WebSocket(`ws://${host}/api/data`);

    socket.onopen = () => setStatus("Connected");
    socket.onclose = () => setStatus("Disconnected");

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
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
      } catch (e) {
        console.error("WebSocket parse error", e);
      }
    };

    return () => socket.close();
  }, []);

  // After device/sensor updates, render or update charts
  useEffect(() => {
    Object.entries(devices).forEach(([deviceId, sensors]) => {
      Object.entries(sensors).forEach(([sensorName, entries]) => {
        const canvasId = `${deviceId}-${sensorName}`;
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        if (!canvas) return;

        const labels = entries.map((entry) =>
          new Date(Number(entry.time) / 1e6).toLocaleTimeString()
        );
        const values = entries.map((entry) => {
          const valueKeys = Object.keys(entry).filter((k) => k !== "time");
          return entry[valueKeys[0]] as number;
        });

        const datasetLabel = `${deviceId} - ${sensorName}`;

        if (chartRefs.current[canvasId]) {
          chartRefs.current[canvasId].data.labels = labels;
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
  }, [devices]);

  return (
    <div>
      <h2 class="text-lg font-semibold mb-4">Connection Status: {status}</h2>
      {Object.entries(devices).map(([deviceId, sensors]) => (
        <div class="mb-10" key={deviceId}>
          <h3 class="text-xl mb-2">Device: {deviceId}</h3>
          {Object.entries(sensors).map(([sensorName]) => {
            const canvasId = `${deviceId}-${sensorName}`;
            return (
              <div class="mb-4" key={canvasId}>
                <h4 class="text-md mb-1">{sensorName}</h4>
                <canvas id={canvasId} height="150" />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
