// /components/SensorCharts.tsx

// SensorCharts.tsx – handles rendering all charts for one device

import ChartCanvas from "./ChartCanvas.tsx";
import FieldSelector from "./FieldSelector.tsx";

interface SensorChartsProps {
  deviceId: string;
  sensors: Record<string, ({ time: number } & Record<string, unknown>)[]>;
  selectedFields: Record<string, string>;
  onFieldChange: (canvasId: string, newValue: string) => void;
}

export default function SensorCharts({
  deviceId,
  sensors,
  selectedFields,
  onFieldChange,
}: SensorChartsProps) {
  return (
    <div class="mb-10">
      <h3 class="text-xl mb-2">Device: {deviceId}</h3>

      {Object.entries(sensors).map(([sensorName, entries]) => {
        const canvasId = `${deviceId}-${sensorName}`;
        const fieldOptions = Object.keys(entries[0] ?? {}).filter(
          (k) => k !== "time" && typeof entries[0][k] !== "string",
        );
        const selectedKey = selectedFields[canvasId] || fieldOptions[0];

        const timestamps = entries.map((entry) =>
          new Date(Number(entry.time) / 1e6).toISOString()
        );
        const values = entries.map((entry) => Number(entry[selectedKey]));
        const datasetLabel = `${deviceId} - ${sensorName} (${selectedKey})`;

        return (
          <div class="mb-6" key={canvasId}>
            <h4 class="text-md mb-1">{sensorName}</h4>

            <FieldSelector
              options={fieldOptions}
              value={selectedKey}
              onChange={(newValue) => onFieldChange(canvasId, newValue)}
            />

            <ChartCanvas
              id={canvasId}
              label={datasetLabel}
              timestamps={timestamps}
              values={values}
            />
          </div>
        );
      })}
    </div>
  );
}
