import { Context, Hono } from 'hono'
import { Users, ID, Account, } from "https://deno.land/x/appwrite@12.2.0/mod.ts";
import { userClient } from "../../../lib/user.mod.ts";
import { accountClient } from "../../../lib/account.mod.ts";
import { HTTPException } from "hono/http-exception";
import { AppwriteErrorException } from "../../../lib/appwriteException.ts";
interface AdminType {
  userId: string
  email: string
  password: string
  name: string
}
const admin = new Hono()
const users = new Users(userClient)
const account = new Account(accountClient)

admin.post("/sign", async (c: Context) => {
  const data: AdminType = await c.req.json() 
  const { email, password, name } = data
  const method = c.req.method
  const path = c.req.path
  try {
    const newAdmin = await account.create(
      ID.unique(),
      email,
      password,
      name,
      
    )
    if(newAdmin) {
      try {
        await users.updateLabels(
          newAdmin.$id,
          ['admin']
        )
      } catch (error) {
        const e = error as AppwriteErrorException
        console.error(`Error:S402 at ${method} ${path}`, error);
        throw new HTTPException(e.code, {
          message: `${e.message}`,
          cause: `${e.type}`,
        });
      }
    }
    return c.json("Success to create admin, you can login now")
  } catch (error) {
    const e = error as AppwriteErrorException
    console.error(`Error:S402 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
})

admin.post("/login", async (c: Context) => {
  const data = await c.req.json() 
  const { email, password } = data
  const method = c.req.method
  const path = c.req.path
  try {
    const response = await account.createEmailPasswordSession(
      email,
      password
    )
    console.log(data)
    console.log(response)
    return c.json("Correct")
  } catch (error) {
    const e = error as AppwriteErrorException
    console.error(`Error:S402 at ${method} ${path}`, error);
    throw new HTTPException(e.code, {
      message: `${e.message}`,
      cause: `${e.type}`,
    });
  }
})

export default admin



