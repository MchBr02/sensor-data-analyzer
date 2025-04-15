// /routes/_app/tsx

import { type PageProps } from "$fresh/server.ts";

import { log } from "../utils/log.ts";

log(`Loaded: /routes/_app/tsx`);

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>sensor-data-analyzer</title>
        <link rel="stylesheet" href="/styles.css" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
