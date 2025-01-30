import { Context, Hono } from "hono";
import admin from "./admin/admin.ts";

const account = new Hono();

account.get("/", (c: Context) => {
  return c.text(`simgle`);
});

account.route("/admin", admin);

export default account;
