import { Context, Hono } from 'hono'

const app = new Hono()

app.get('/', (c: Context) => {
  const env = Deno.env.get("HONO_API_SECRET_KEY")
  console.log(env)
  return c.text(`your api ${env}`)
})

Deno.serve(app.fetch)
