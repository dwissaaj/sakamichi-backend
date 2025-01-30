import { Context, Hono } from "hono";
import image from "./image/image.ts";
import { AppwriteErrorException } from "../../lib/appwriteException.ts";
import { HTTPException } from "hono/http-exception";
import {
  Databases,
  ID,
  Permission,
  Role,
} from "https://deno.land/x/appwrite@12.2.0/mod.ts";
HTTPException;
import { createDatabaseClient } from "../../lib/database.mod.ts";
import { getCookie } from "hono/cookie";
const single = new Hono();

single.get("/:id", (c: Context) => {
  return c.text(`simgle`);
});
single.post("/add", async (c: Context) => {
  const method = c.req.method;
  const path = c.req.path;
  const data = await c.req.json();
  const allCookies = getCookie(c, "secretJwt");
  if (!allCookies) {
    throw new HTTPException(404, {
      message: "Need Cookies JWT as auth",
      cause: "No Cookies detected",
    });
  }
  try {
    const database = createDatabaseClient(allCookies);
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
    console.log(response);
    return c.text("Success");
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S402 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});
single.route("/image", image);
export default single;
