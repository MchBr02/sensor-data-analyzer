// /utils/log.ts

log(`Loaded: /utils/log.ts`); // <- Defaoult

log(`->| LogTest`, "raw");
log(`LogTest`, "info"); // <- Defaoult
log(`LogTest`, "success");
log(`LogTest`, "error");
log(`LogTest`, "debug");
log(`LogTest`, "warn");

type LogType = "raw" | "info" | "success" | "error" | "debug" | "warn";

export function log(message: string, type: LogType = "info"): void {
  const devider = `|`;
  const _ = ` `;
  const prefixMap: Record<LogType, string> = {
    raw: ``,
    info: `ℹ️ ${devider}${_}`,
    success: `✅${devider}${_}`,
    error: `❌${devider}${_}`,
    debug: `🐛${devider}${_}`,
    warn: `⚠️ ${devider}${_}`,
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