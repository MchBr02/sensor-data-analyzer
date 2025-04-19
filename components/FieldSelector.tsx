// /components/FieldSelector.tsx

import { log } from "../utils/log.ts";

log(`Loaded: /components/FieldSelector.tsx`);

interface FieldSelectorProps {
    label?: string;
    options: string[];
    value: string;
    onChange: (newValue: string) => void;
  }
  
  export default function FieldSelector({ label = "Select field to display:", options, value, onChange }: FieldSelectorProps) {
    return (
      <label class="block text-sm mb-1">
        {label}
        <select
          class="ml-2 px-2 py-1 border rounded"
          value={value}
          onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
        >
          {options.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </label>
    );
  }
  