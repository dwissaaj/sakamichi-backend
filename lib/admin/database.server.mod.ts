import { Client } from "https://deno.land/x/appwrite/mod.ts";

export const createDatabaseServer = (sessionToken: string): Client => {
  const client = new Client();

  client
    .setEndpoint(`${Deno.env.get("HONO_API_ENDPOINT")}`)
    .setProject(`${Deno.env.get("HONO_PROJECT_ID")}`)
    .setSession(sessionToken);

  return client;
};
