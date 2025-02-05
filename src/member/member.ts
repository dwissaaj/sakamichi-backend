import { Context, Hono } from "hono";
import { cors } from "hono/cors";

const member = new Hono();

member.use(
  "/member/*",
  cors({
    origin: "http://sakamichi.cloud", // Allowed origin
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "DELETE", "PATCH"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

member.all("/all", (c) => {
    const origin = c.req.header('Origin')
  
    // Check if the origin is allowed
    if (origin !== "http://sakamichi.cloud") {
      return c.json({ error: "CORS origin not allowed" }, 403);
    }
  
    // If origin is valid, return the response
    return c.json({ success: true });
  });

export default member;
