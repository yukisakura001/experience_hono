import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json"; // 初期搭載ミドルウェア
import posts from "./blogs/blogs";
import auth from "./auth/auth";
import { basicAuth } from "hono/basic-auth";

const app = new Hono();

app.use("*", prettyJSON()); // /posts?pretty でjsonを見やすく表示可能
app.use("/auth/*", basicAuth({ username: "admin", password: "admin" }));

app.route("/posts", posts); // /posts/ の下に各APIを生やせる
app.route("/auth", auth); // /auth/ の下に各APIを生やせる

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

export default app;
