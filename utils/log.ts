// /utils/log.ts

log(`Loaded: /utils/log.ts`, "raw");
log(`Loaded: /utils/log.ts`); // <- Defaoult
log(`Loaded: /utils/log.ts`, "info"); // <- Defaoult
log(`Loaded: /utils/log.ts`, "success");
log(`Loaded: /utils/log.ts`, "error");
log(`Loaded: /utils/log.ts`, "debug");
log(`Loaded: /utils/log.ts`, "warn");

type LogType = "raw" | "info" | "success" | "error" | "debug" | "warn";

export function log(message: string, type: LogType = "info"): void {
  const prefixMap: Record<LogType, string> = {
    raw: "",
    info: "ℹ️ | ",
    success: "✅| ",
    error: "❌| ",
    debug: "🐛| ",
    warn: "⚠️ | ",
  };

  const logFnMap: Record<LogType, (...args: any[]) => void> = {
    raw: console.log,
    info: console.log,
    success: console.log,
    error: console.error,
    debug: console.debug,
    warn: console.warn,
  };

  const prefix = prefixMap[type];
  const logFn = logFnMap[type];

  logFn(`${prefix}${message}`);
}