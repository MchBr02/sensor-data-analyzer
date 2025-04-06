/**
 * Log success message in a consistent format
 */
export function logSuccess(message: string): void {
    console.log(`✅ ${message}`);
}

/**
 * Log error message in a consistent format
 */
export function logError(message: string): void {
    console.error(`❌ ${message}`);
}