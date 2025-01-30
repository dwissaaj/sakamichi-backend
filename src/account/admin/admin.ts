import { Context, Hono } from "hono";
import { Account, ID, Users } from "https://deno.land/x/appwrite@12.2.0/mod.ts";
import { userClient } from "../../../lib/user.mod.ts";
import { accountClient } from "../../../lib/account.mod.ts";
import { HTTPException } from "hono/http-exception";
import { AppwriteErrorException } from "../../../lib/appwriteException.ts";
import { setSignedCookie } from "hono/cookie";
interface AdminType {
  userId: string;
  email: string;
  password: string;
  name: string;
}
const admin = new Hono();
const users = new Users(userClient);
const account = new Account(accountClient);

admin.post("/sign", async (c: Context) => {
  const data: AdminType = await c.req.json();
  const { email, password, name } = data;
  const method = c.req.method;
  const path = c.req.path;
  try {
    const newAdmin = await account.create(
      ID.unique(),
      email,
      password,
      name,
    );
    if (newAdmin) {
      try {
        await users.updateLabels(
          newAdmin.$id,
          ["admin"],
        );
      } catch (error) {
        const e = error as AppwriteErrorException;
        console.error(`Error:S401 at ${method} ${path}`, error);
        throw new HTTPException(e.code, {
          message: `${e.message}`,
          cause: `${e.type}`,
        });
      }
    }
    return c.json("Success to create admin, you can login now");
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

admin.post("/login", async (c: Context) => {
  const data = await c.req.json();
  const { email, password } = data;
  const method = c.req.method;
  const path = c.req.path;
  try {
    const response = await account.createEmailPasswordSession(
      email,
      password,
    );

    if (response) {
      const session = await users.createSession(response.userId);
      const cookieSecret = session.secret;
      if (cookieSecret) {
        await setSignedCookie(
          c,
          "secretJwt",
          cookieSecret,
          Deno.env.get("COOKIES_SECRET") as string,
          {
            path: "/",
            secure: true,
            domain: "sakamichi.cloud",
            httpOnly: true,
            maxAge: 3600,
            expires: new Date(Date.now() + 3600 * 1000),
            sameSite: "Strict",
          },
        );
      }
    }

    return c.json({
      message: "Success at login secret will put at your browser",
    });
  } catch (error) {
    const e = error as AppwriteErrorException;
    console.error(`Error:S401 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
});

export default admin;
