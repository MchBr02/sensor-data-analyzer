// /utils/validSensorDataStructure.ts

import { log } from "./log.ts";

log(`Loaded: /utils/validSensorDataStructure.ts`);

/**
 * Utility function to validate if an object is non-null and of a specific type
 */
function isNonNullObject(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === "object" && obj !== null;
}

/**
 * Validate a single item from the payload
 */
export function isValidPayloadItem(item: unknown): item is Record<string, unknown> {
    return (
        isNonNullObject(item) &&
        typeof item.name === "string" &&
        item.name.trim() !== "" &&
        typeof item.time === "number" &&
        isNonNullObject(item.values)
    );
}

/**
 * Utility function to validate the basic structure of the requestData
 */
export const validateBasicStructure = (requestData: Record<string, unknown>): boolean => {
    // Check if request has body
    if (!isNonNullObject(requestData.body)) return false;

    const body = requestData.body;
    return (
        typeof body.deviceId === "string" &&
        typeof body.sessionId === "string" &&
        Array.isArray(body.payload) &&
        body.payload.every(isValidPayloadItem)
    );
};