import { Context, Hono } from "hono";
import { AppwriteErrorException } from "../../../lib/appwriteException.ts";
import { HTTPException } from "hono/http-exception";
import { createDatabaseServer } from "../../../lib/admin/database.server.mod.ts";
import { getCookie } from "hono/cookie";
import {
    Databases,
    ID,
    Permission,
    Query,
    Role,
  } from "https://deno.land/x/appwrite@12.2.0/mod.ts";
import { databasePublicClient } from "../../../lib/public/database.public.mod.ts"
const position = new Hono()
const publicDatabase = new Databases(databasePublicClient);
position.get("/:id", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const id = c.req.param("id")
    try {
      const result = await publicDatabase.listDocuments(
        Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
        Deno.env.get("HONO_SINGLE_COLLECTION_POSITIONS_ID") as string,
        [
          Query.equal("singleId", id)
        ]
      )
      return c.json({position: result})
    } catch (error) {
      const e = error as AppwriteErrorException;
      console.error(`Error:S401 at ${method} ${path}`, error);
      throw new HTTPException(e.code, {
        message: `${e.message}`,
        cause: `${e.type}`,
      });
    }
})
position.post("/add", async (c: Context) => {
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
      Deno.env.get("HONO_SINGLE_COLLECTION_POSITIONS_ID") as string,
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
position.patch("/update/:id", async (c: Context) => {
  const id = c.req.param("id")
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
    const response = await databaseFunction.updateDocument(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_POSITIONS_ID") as string,
      id,
      data,
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
position.delete("/delete/:id", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const id = c.req.param("id")
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
      Deno.env.get("HONO_SINGLE_COLLECTION_POSITIONS_ID") as string,
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
export default position