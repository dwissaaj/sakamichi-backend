import { Client } from "https://deno.land/x/appwrite/mod.ts";

export const databasePublicClient: Client = new Client();

databasePublicClient
  .setEndpoint(`${Deno.env.get("HONO_API_ENDPOINT")}`)
  .setProject(`${Deno.env.get("HONO_PROJECT_ID")}`);
