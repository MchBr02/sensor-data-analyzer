type LogType = "info" | "success" | "error" | "debug" | "warn";

export function log(message: string, type: LogType = "info"): void {
  const prefixMap: Record<LogType, string> = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    debug: "🐛",
    warn: "⚠️",
  };

  const logFnMap: Record<LogType, (...args: any[]) => void> = {
    info: console.log,
    success: console.log,
    error: console.error,
    debug: console.debug,
    warn: console.warn,
  };

  const prefix = prefixMap[type];
  const logFn = logFnMap[type];

  logFn(`${prefix} ${message}`);
}
