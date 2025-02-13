import { Context, Hono } from "hono";
import { AppwriteErrorException } from "../../../lib/appwriteException.ts";
import { HTTPException } from "hono/http-exception";
import { createDatabaseServer } from "../../../lib/admin/database.server.mod.ts";
import { getCookie } from "hono/cookie";
import {
  Databases,
  ID,
  InputFile,
  Permission,
  Query,
  Role,
  Storage,
} from "https://deno.land/x/appwrite@12.2.0/mod.ts";
import { databasePublicClient } from "../../../lib/public/database.public.mod.ts";

import { createStorageClient } from "../../../lib/admin/storage.mod.ts";
const gallery = new Hono();
const publicDatabase = new Databases(databasePublicClient);

gallery.get("/partial", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  try {
    const result = await publicDatabase.listDocuments(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_GALLERY_ID") as string,
      [
        Query.equal("isProfile", true),
        // Query.select(["name","galleryOfMember" ])
      ],
    );
    return c.json({ cover: result });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
gallery.get("/:id", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const id = c.req.param("id");
  try {
    const result = await publicDatabase.listDocuments(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_GALLERY_ID") as string,
      [
        Query.equal("galleryOfMember", id),
        Query.select([
          "name",
          "date",
          "url",
          "isProfile",
          "$createdAt",
          "$updatedAt",
          "$id",
        ]),
      ],
    );
    return c.json({ gallery: result });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
gallery.post("/add/:memberid", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const allCookies = getCookie(c, "secretJwt");

  // for image
  const formData = await c.req.formData();
  const name = formData.get("name") as string;
  const isProfile = formData.get("isProfile") === "true";
  const file = formData.get("image") as File;
  const originalFileName = file.name;
  const date = formData.get("date") as string;
  const memberid = c.req.param("memberid");
  if (!allCookies) {
    throw new HTTPException(404, {
      message: "Error:S404 Need Cookies JWT as auth",
      cause: "No Cookies detected please login first",
    });
  }
  try {
    const storage = createStorageClient(allCookies);
    const storageFunction = new Storage(storage);
    const response = await storageFunction.createFile(
      Deno.env.get("HONO_PRODUCTION_BUCKET_ID") as string,
      ID.unique(),
      await InputFile.fromBlob(file, originalFileName),
      [
        Permission.read(Role.any()),
        Permission.write(Role.label("admin")),
      ],
    );
    if (response) {
      const urlImage = `${Deno.env.get("HONO_API_ENDPOINT")}/storage/buckets/${
        Deno.env.get("HONO_PRODUCTION_BUCKET_ID")
      }/files/${response.$id}/view?project=${Deno.env.get("HONO_PROJECT_ID")}`;
      try {
        const database = createDatabaseServer(allCookies);
        const databaseFunction = new Databases(database);
        const createDocument = await databaseFunction.createDocument(
          Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
          Deno.env.get("HONO_SINGLE_COLLECTION_GALLERY_ID") as string,
          ID.unique(),
          {
            name: name,
            url: urlImage,
            date: date,
            isProfile: isProfile,
            galleryOfMember: memberid,
          },
          [
            Permission.read(Role.any()),
            Permission.write(Role.label("admin")),
          ],
        );
        if (isProfile === true) {
          await databaseFunction.updateDocument(
            Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
            Deno.env.get("HONO_SINGLE_COLLECTION_MEMBERS_ID") as string,
            memberid,
            {
              profilePic: urlImage,
            },
          );
        }
        return c.json({ gallery: createDocument });
      } catch (error) {
        const e = error as AppwriteErrorException;
        console.error(`Error:S401 at ${method} ${path}`, error);
        throw new HTTPException(e.code, {
          message: `${e.message}`,
          cause: `${e.type}`,
        });
      }
    }
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
gallery.patch("/update/:galleryid", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const allCookies = getCookie(c, "secretJwt");

  // for image
  const formData = await c.req.formData();
  const name = formData.get("name") as string;
  const file = formData.get("image") as File;
  const isProfile = formData.get("isProfile") === "true";
  const originalFileName = file.name;
  const date = formData.get("date") as string;
  const galleryid = c.req.param("galleryid");
  if (!allCookies) {
    throw new HTTPException(404, {
      message: "Error:S404 Need Cookies JWT as auth",
      cause: "No Cookies detected please login first",
    });
  }
  try {
    const storage = createStorageClient(allCookies);
    const storageFunction = new Storage(storage);
    const response = await storageFunction.createFile(
      Deno.env.get("HONO_PRODUCTION_BUCKET_ID") as string,
      ID.unique(),
      await InputFile.fromBlob(file, originalFileName),
      [
        Permission.read(Role.any()),
        Permission.write(Role.label("admin")),
      ],
    );
    if (response) {
      const urlImage = `${Deno.env.get("HONO_API_ENDPOINT")}/storage/buckets/${
        Deno.env.get("HONO_PRODUCTION_BUCKET_ID")
      }/files/${response.$id}/view?project=${Deno.env.get("HONO_PROJECT_ID")}`;
      try {
        const database = createDatabaseServer(allCookies);
        const databaseFunction = new Databases(database);
        const response = await databaseFunction.updateDocument(
          Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
          Deno.env.get("HONO_SINGLE_COLLECTION_GALLERY_ID") as string,
          galleryid,
          {
            name: name,
            url: urlImage,
            date: date,
            isProfile: isProfile,
          },
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
    }
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
gallery.delete("/delete/:id", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const id = c.req.param("id");
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
      Deno.env.get("HONO_SINGLE_COLLECTION_GALLERY_ID") as string,
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
export default gallery;
