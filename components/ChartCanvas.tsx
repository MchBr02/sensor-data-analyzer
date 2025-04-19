// /components/ChartCanvas.tsx

import { useEffect, useRef } from "preact/hooks";

import Chart, { _adapters } from "https://esm.sh/stable/chart.js@4.4.0/auto?target=es2022";
import type { Chart as ChartJS } from "https://esm.sh/stable/chart.js@4.4.0/auto?target=es2022";

import { log } from "../utils/log.ts";

log(`Loaded: /components/ChartCanvas.tsx`);
log(`Adapter override active: ${typeof (_adapters._date as any).format}`);
log(`Chart date adapter override set: ${typeof (_adapters._date as any).format === "function"}`);

interface ChartCanvasProps {
  id: string;
  label: string;
  timestamps: string[];
  values: number[];
}

export default function ChartCanvas({ id, label, timestamps, values }: ChartCanvasProps) {
  const chartRef = useRef<ChartJS<"line", { x: number; y: number }[], unknown> | null>(null);
  const lastLabelRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;

    // Convert timestamps to seconds-based points
    const newDataPoints = timestamps.map((t, i) => ({
      x: new Date(t).getTime() / 1000, // x-axis in seconds
      y: values[i],
    }));

    const shouldRecreate = lastLabelRef.current !== label;

    if (chartRef.current && !shouldRecreate) {
      // Only append new data if label hasn't changed
      const chartData = chartRef.current.data.datasets[0].data as { x: number; y: number }[];

      // Get the last x value in chart (if any)
      const lastX = chartData.length ? chartData[chartData.length - 1].x : -Infinity;

      // Filter new points so we only add newer ones
      const uniqueNewPoints = newDataPoints.filter((p) => p.x > lastX);

      if (uniqueNewPoints.length > 0) {
        chartData.push(...uniqueNewPoints);

        // Limit data points
        const MAX_POINTS = 100;
        if (chartData.length > MAX_POINTS) {
          chartData.splice(0, chartData.length - MAX_POINTS);
        }

        chartRef.current.data.datasets[0].label = label;
        chartRef.current.update();
      }
    } else {
      // Destroy existing chart if needed
      if (chartRef.current) {
        chartRef.current.destroy();
      } else {
        const existing = Chart.getChart(canvas);
        if (existing) existing.destroy();
      }

      // Create new chart
      chartRef.current = new Chart(canvas, {
        type: "line",
        data: {
          datasets: [{
            label,
            data: newDataPoints,
            borderColor: "#4ADE80",
            backgroundColor: "rgba(74, 222, 128, 0.3)",
            fill: true,
            tension: 0.3,
          }],
        },
        options: {
          parsing: false,
          scales: {
            x: {
              type: "linear",
              title: {
                display: true,
                text: "Time (s)",
              },
              ticks: {
                callback: (val) => new Date(Number(val) * 1000).toLocaleTimeString(),
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [timestamps, values, label]);

  return <canvas id={id} height="150" />;
}
