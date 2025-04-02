// routes/api/dbcheck.ts

import { dbCheck } from "../../utils/database.ts";

export async function handler(_req: Request): Promise<Response> {
  try {
    await dbCheck();
    return new Response("Database connected successfully", { status: 200 });
} catch (error) {
    let errorMessage = "Failed during execution of prepareDatabase() function";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new Response(`Database connection failed: ${errorMessage}`, { status: 500 });
  }
}