import { Hono } from "hono";

const app = new Hono();

app.get("/page", (c) => {
  return c.text("認証が通りました");
});

export default app;
