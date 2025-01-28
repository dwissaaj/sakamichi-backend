import { Client, } from "https://deno.land/x/appwrite/mod.ts";

const client: Client = new Client();

client
    .setEndpoint(`${Deno.env.get("HONO_API_ENDPOINT")}`)
    .setProject(`${Deno.env.get("HONO_PROJECT_ID")}`)
    .setKey(`${Deno.env.get("HONO_API_SECRET_KEY")}`)
