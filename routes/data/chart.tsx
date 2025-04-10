// ./routes/data/chart.tsx

import LiveDeviceData from "../../islands/LiveDeviceData.tsx";
import LiveSensorCharts from "../../islands/LiveSensorCharts.tsx";

export default function DataPage() {
  return (
    <div class="flex flex-wrap gap-6 p-4">
      {/* Live Sensor Charts Panel */}
      <div
        class="flex-1 min-w-[300px] max-w-[900px] border border-gray-500 rounded-lg p-4"      >
        <h1 class="text-2xl font-bold mb-4">📊 Live Sensor Charts</h1>
        <LiveSensorCharts />
      </div>

      {/* Live Device Data Panel */}
      <div class="flex-1 min-w-[300px] max-w-[600px] border border-gray-500 rounded-lg p-4">
        <h1 class="text-xl font-bold mb-2">📦 Live Data</h1>
        <LiveDeviceData />
      </div>
    </div>
  );
}