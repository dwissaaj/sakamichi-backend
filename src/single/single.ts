import { Context, Hono } from "hono";
import image from "./image/image.ts";

const single = new Hono();

single.get("/", (c: Context) => {
  return c.text(`simgle`);
});

single.route("/image", image);
export default single;
