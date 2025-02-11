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
import { UpdateCoverData } from "./covers.dto.ts";
const cover = new Hono();
const publicDatabase = new Databases(databasePublicClient);
cover.get("/:id", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const id = c.req.param("id");
  try {
    const result = await publicDatabase.listDocuments(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_COVERS_ID") as string,
      [
        Query.equal("singleId", id),
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
cover.post("/add/:singleid", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const allCookies = getCookie(c, "secretJwt");

  // for image
  const formData = await c.req.formData();
  const name = formData.get("name") as string;
  const file = formData.get("image") as File;
  const numberCover = Number(formData.get("numberCover"));
  const singleid = c.req.param("singleid");
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
      await InputFile.fromBlob(file, name),
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
        const response = await databaseFunction.createDocument(
          Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
          Deno.env.get("HONO_SINGLE_COLLECTION_COVERS_ID") as string,
          ID.unique(),
          {
            name: name,
            url: urlImage,
            numberCover: numberCover,
            singleId: singleid,
          },
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
cover.patch("/update/:coverId", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const coverId = c.req.param("coverId");
  const allCookies = getCookie(c, "secretJwt");

  if (!allCookies) {
    throw new HTTPException(404, {
      message: "Error:S404 Need Cookies JWT as auth",
      cause: "No Cookies detected, please log in first",
    });
  }

  try {
    const formData = await c.req.formData();
    const name = formData.get("name") as string;
    const numberCover = Number(formData.get("numberCover"));
    const singleId = formData.get("singleId") as string;
    const file = formData.get("image") as File | null; // Optional image

    const database = createDatabaseServer(allCookies);
    const databaseFunction = new Databases(database);

    let urlImage = null;

    if (file) {
      // If a new image is provided, upload and get the new URL
      const storage = createStorageClient(allCookies);
      const storageFunction = new Storage(storage);
      const response = await storageFunction.createFile(
        Deno.env.get("HONO_PRODUCTION_BUCKET_ID") as string,
        ID.unique(),
        await InputFile.fromBlob(file, file.name),
        [
          Permission.read(Role.any()),
          Permission.write(Role.label("admin")),
        ],
      );

      urlImage = `${Deno.env.get("HONO_API_ENDPOINT")}/storage/buckets/${
        Deno.env.get("HONO_PRODUCTION_BUCKET_ID")
      }/files/${response.$id}/view?project=${Deno.env.get("HONO_PROJECT_ID")}`;
    }

    const updateData: UpdateCoverData = { name, numberCover, singleId };
    if (urlImage) {
      updateData.url = urlImage; // Only update the image if a new one is uploaded
    }

    // Update the document
    const updatedCover = await databaseFunction.updateDocument(
      Deno.env.get("HONO_SINGLE_DATABASE_ID") as string,
      Deno.env.get("HONO_SINGLE_COLLECTION_COVERS_ID") as string,
      coverId,
      updateData,
    );

    return c.json({ success: true, updatedCover });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

cover.delete("/delete/:id", async (c: Context) => {
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
      Deno.env.get("HONO_SINGLE_COLLECTION_COVERS_ID") as string,
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
export default cover;
