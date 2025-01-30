import { Context, Hono } from "hono";
import { AppwriteErrorException } from "../../../lib/appwriteException.ts";
import { HTTPException } from "hono/http-exception";
import {
  ID,
  InputFile,
  Permission,
  Role,
  Storage,
} from "https://deno.land/x/appwrite@12.2.0/mod.ts";
import { getCookie } from "hono/cookie";
import { createStorageClient } from "../../../lib/storage.mod.ts";
const image = new Hono();

image.post("/", async (c: Context) => {
  const data = await c.req.formData();
  const name = data.get("filename") as string;
  const file = data.get("image") as File;
  const method = c.req.method;
  const path = c.req.path;
  const allCookies = getCookie(c, "secretJwt");
  if (!allCookies) {
    throw new HTTPException(404, {
      message: "Need Cookies JWT as auth",
      cause: "No Cookies detected",
    });
  }
  try {
    const storage = createStorageClient(allCookies);
    const storageFunction = new Storage(storage);
    const response = await storageFunction.createFile(
      Deno.env.get("HONO_IMAGE_SINGLE_BUCKET_ID") as string,
      ID.unique(),
      await InputFile.fromBlob(file, name),
      [
        Permission.read(Role.any()),
        Permission.read(Role.label("admin")),
        Permission.read(Role.guests()),
      ],
    );
    if (response) {
      const urlImage = `${Deno.env.get("HONO_API_ENDPOINT")}/storage/buckets/${
        Deno.env.get("HONO_IMAGE_SINGLE_BUCKET_ID")
      }/files/${response.$id}`;

      return c.json({ "urlImage": `${urlImage}` });
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
image.get("/:id", async (c: Context) => {
  const id = c.req.param("id");
  const method = c.req.method;
  const path = c.req.path;
  const allCookies = getCookie(c, "secretJwt");
  if (!allCookies) {
    throw new HTTPException(404, {
      message: "Need Cookies JWT as auth",
      cause: "No Cookies detected",
    });
  }
  try {
    const storage = createStorageClient(allCookies);
    const storageFunction = new Storage(storage);
    const preview = await storageFunction.getFilePreview(
      Deno.env.get("HONO_IMAGE_SINGLE_BUCKET_ID") as string,
      id,
    );
    c.header("Content-Type", "image/jpeg");
    return c.body(preview);
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

export default image;
