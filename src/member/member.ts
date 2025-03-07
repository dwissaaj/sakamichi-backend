import { Context, Hono } from "hono";
import { AppwriteErrorException } from "../../lib/appwriteException.ts";
import { HTTPException } from "hono/http-exception";
import { createDatabaseServer } from "../../lib/admin/database.server.mod.ts";
import { getCookie } from "hono/cookie";
import {
  Databases,
  ID,
  Permission,
  Query,
  Role,
} from "https://deno.land/x/appwrite@12.2.0/mod.ts";
import { databasePublicClient } from "../../lib/public/database.public.mod.ts";
import funfact from "../member/funfact/funfact.ts";
import gallery from "../member/gallery/gallery.ts";
import social from "./social/social.ts";
const member = new Hono();
const databasePublic = new Databases(databasePublicClient);
member.get("/profile", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  try {
    const data = await databasePublic.listDocuments(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_MEMBERS_ID") as string,
      [
        Query.select([
          "name",
          "profilePic",
          "$id",
          "group",

        ]),
      ],
    );
    return c.json({profile : data});
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
member.get("/get/:id", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const id = c.req.param("id");
  try {
    const data = await databasePublic.getDocument(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_MEMBERS_ID") as string,
      id,
      [
        Query.select([
          "name",
          "birthdate",
          "penlight",
          "debut",
          "graduate",
          "bloodtype",
          "agency",
          "nameKana",
          "nameKanji",
          "generation",
          "group",
          "birthplace",
          "height",
          "nickname",
          "$id",
          "$createdAt",
          "$updatedAt",
          "profilePic"
        ]),
      ],
    );
    return c.json(data);
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
member.get("/all", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  try {
    const data = await databasePublic.listDocuments(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_MEMBERS_ID") as string,
      [
        Query.select(["name"]),
      ],
    );
    return c.json(data);
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

member.post("/add", async (c: Context) => {
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
      Deno.env.get("HONO_SINGLE_COLLECTION_MEMBERS_ID") as string,
      ID.unique(),
      data,
      [
        Permission.read(Role.any()),
        Permission.write(Role.label("admin")),
      ],
    );
    return c.json({ member: response });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
member.patch("/update/:id", async (c: Context) => {
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
      Deno.env.get("HONO_SINGLE_COLLECTION_MEMBERS_ID") as string,
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

member.delete("/remove/:id", async (c: Context) => {
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
      Deno.env.get("HONO_SINGLE_COLLECTION_MEMBERS_ID") as string,
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
member.route("/funfact", funfact);
member.route("/social", social);
member.route("/gallery", gallery);
export default member;
