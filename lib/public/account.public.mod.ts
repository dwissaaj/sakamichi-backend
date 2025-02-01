import { Client } from "https://deno.land/x/appwrite/mod.ts";

export const accountClient: Client = new Client();

accountClient
  .setEndpoint(`${Deno.env.get("HONO_API_ENDPOINT")}`)
  .setProject(`${Deno.env.get("HONO_PROJECT_ID")}`);
