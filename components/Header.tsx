// /components/Header.tsx

import { log } from "../utils/log.ts";

log(`Loaded: /components/Header.tsx`);

export default function Header() {
    return (
        <header class="">
            <a href="/" class="m-4 font-semibold text-gray-800 border border-gray-500 rounded-lg">📊 Sensor data analyzer</a>
        </header>
    );
}