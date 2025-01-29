import { Context, Hono } from 'hono'

const image = new Hono()

image.get('/', (c: Context) => {
  return c.text(`your api`)
})

export default image
