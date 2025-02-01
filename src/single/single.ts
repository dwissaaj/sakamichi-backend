import { Context, Hono } from "hono";
import image from "./image/image.ts";
import { AppwriteErrorException } from "../../lib/appwriteException.ts";
import { HTTPException } from "hono/http-exception";
import {
  Databases,
  ID,
  Permission,
  Query,
  Role,
} from "https://deno.land/x/appwrite@12.2.0/mod.ts";
HTTPException;
import { createDatabaseServer } from "../../lib/admin/database.server.mod.ts";
import { databasePublicClient } from "../../lib/public/database.public.mod.ts";

import { getCookie } from "hono/cookie";
import trivia from "./trivia/trivia.ts";
const single = new Hono();
const databasePublic = new Databases(databasePublicClient);
single.get("/all", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  try {
    const response = await databasePublic.listDocuments(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_SINGLES_ID") as string,
    );
    return c.json(response);
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
single.get("/one/:id", async (c: Context) => {
  const id = c.req.param("id");
  const method = c.req.method;
  const path = c.req.path;
  try {
    const response = await databasePublic.getDocument(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_SINGLES_ID") as string,
      id,
    );
    return c.json(response);
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

single.get("/search", async (c: Context) => {
  const method = c.req.method;
  const { group, sortDate } = c.req.query();
  const sortDates = sortDate === "desc"
    ? Query.orderDesc("releaseDate")
    : Query.orderAsc("releaseDate");
  const path = c.req.path;

  try {
    const response = await databasePublic.listDocuments(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_SINGLES_ID") as string,
      [
        Query.contains("group", group),
        sortDates,
      ],
    );

    return c.json({ single: response });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

single.post("/add", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const data = await c.req.json();
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
      Deno.env.get("HONO_SINGLE_COLLECTION_SINGLES_ID") as string,
      ID.unique(),
      data,
      [
        Permission.read(Role.any()),
        Permission.write(Role.label("admin")),
      ],
    );
    return c.json({ single: response });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

single.patch("/update/:id", async (c: Context) => {
  const method = c.req.method;
  const id = c.req.param("id");
  const path = c.req.path;
  const data = await c.req.json();
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
      Deno.env.get("HONO_SINGLE_COLLECTION_SINGLES_ID") as string,
      id,
      data,
      [
        Permission.read(Role.any()),
        Permission.write(Role.label("admin")),
      ],
    );
    return c.json({ single: response });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

single.delete("/remove/:id", async (c: Context) => {
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
      Deno.env.get("HONO_SINGLE_COLLECTION_SINGLES_ID") as string,
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

single.route("/image", image);
single.route("/trivia", trivia)
export default single;
