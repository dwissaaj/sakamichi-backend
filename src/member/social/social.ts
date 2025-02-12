import { Context, Hono } from "hono";
import { AppwriteErrorException } from "../../../lib/appwriteException.ts";
import { HTTPException } from "hono/http-exception";
import { getCookie } from "hono/cookie";
import { createDatabaseServer } from "../../../lib/admin/database.server.mod.ts";
import { databasePublicClient } from "../../../lib/public/database.public.mod.ts";
import {
  Databases,
  ID,
  Permission,
  Query,
  Role,
} from "https://deno.land/x/appwrite@12.2.0/mod.ts";
import { SocialMediaType } from "./social.dto.ts";

Databases;
createDatabaseServer;

const publicDatabase = new Databases(databasePublicClient);
const social = new Hono();
social.get("/:memberId", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const memberId = c.req.param("memberId");
  try {
    const result = await publicDatabase.listDocuments(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_SOCIALMEDIA_ID") as string,
      [
        Query.equal("member", memberId),
        Query.select([
          "instagram",
          "website",
          "showroom",
          "blog",
          "other",
          "$id",
          "$createdAt",
          "$updatedAt",
        ]),
      ],
    );
    return c.json({ social: result });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
social.post("/add/:id", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const id = c.req.param("id");
  const { instagram, website, showroom, blog, other }: SocialMediaType = await c
    .req.json();
  const allCookies = getCookie(c, "secretJwt");
  if (!allCookies) {
    throw new HTTPException(404, {
      message: "Error:S404 Need Cookies JWT as auth",
      cause: "No Cookies detected please login first",
    });
  }
  try {
    const database = createDatabaseServer(allCookies);
    const databaseFunction = new Databases(database);
    const response = await databaseFunction.createDocument(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_SOCIALMEDIA_ID") as string,
      ID.unique(),
      {
        instagram,
        website,
        showroom,
        blog,
        other,
        member: id,
      },
      [
        Permission.read(Role.any()),
        Permission.write(Role.label("admin")),
      ],
    );
    return c.json({ social: response });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
social.patch("/update/:id", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const id = c.req.param("id");
  const data: SocialMediaType = await c.req.json();
  const allCookies = getCookie(c, "secretJwt");
  if (!allCookies) {
    throw new HTTPException(404, {
      message: "Error:S404 Need Cookies JWT as auth",
      cause: "No Cookies detected please login first",
    });
  }
  try {
    const database = createDatabaseServer(allCookies);
    const databaseFunction = new Databases(database);
    const response = await databaseFunction.updateDocument(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_SOCIALMEDIA_ID") as string,
      id,
      data,
    );
    return c.json({ social: response });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

social.delete("/remove/:id", async (c: Context) => {
  const method = c.req.method;
  const id = c.req.param("id");
  const path = c.req.path;
  const allCookies = getCookie(c, "secretJwt");
  if (!allCookies) {
    throw new HTTPException(404, {
      message: "Error:S404 Need Cookies JWT as auth",
      cause: "No Cookies detected please login first",
    });
  }
  try {
    const database = createDatabaseServer(allCookies);
    const databaseFunction = new Databases(database);
    await databaseFunction.deleteDocument(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_SOCIALMEDIA_ID") as string,
      id,
    );
    return c.json({ status: 200, message: "Document deleted successfully" });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
export default social;
