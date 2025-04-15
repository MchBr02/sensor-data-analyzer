// /routes/data/index.tsx

import LiveData from "../../islands/LiveRequestData.tsx";

import { log } from "../../utils/log.ts";

log(`Loaded: /routes/data/index.tsx`);

export default function DataPage() {
    return (
        <div>
            <h1>Latest Sensor Data</h1>
            <div style="width:max-content; outline: 5px solid gray; padding: 10px; margin: 10px">
                <LiveData />
            </div>
        </div>
    );
}
