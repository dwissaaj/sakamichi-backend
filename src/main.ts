import { Context, Hono } from 'hono'
import single from "./single/single.ts";
import account from "./account/account.ts";

const app = new Hono().basePath("/api")

app.get('/', (c: Context) => {
  return c.text('Hi Sakamchi Fans use this API Wisely')
})

app.route('/single', single)
app.route("/account", account)
Deno.serve(app.fetch)
