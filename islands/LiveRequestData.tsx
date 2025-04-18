// /islands/LiveRequestData.tsx

import { useEffect, useState } from "preact/hooks";
import { getSharedWebSocketClient } from "../utils/websocket.ts";
import { log } from "../utils/log.ts";

log(`Loaded: /islands/LiveRequestData.tsx`);

export default function LiveData() {
  const [data, setData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    const ws = getSharedWebSocketClient();

    const unsubscribe = ws.subscribe((incomingData) => {
      setData((prevData) => ({ ...prevData, ...incomingData }));
    });

    const stopStatusUpdates = ws.onStatusChange(setConnectionStatus);

    return () => {
      unsubscribe();
      stopStatusUpdates();
    };
  }, []);

  return (
    <div>
      <h2>Connection Status: {connectionStatus}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}