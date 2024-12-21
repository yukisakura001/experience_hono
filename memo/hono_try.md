# hono導入～cloudflare workersにデプロイ

# 参考資料

-  [Hono - Web framework built on Web Standards](https://hono.dev/)
  - 公式ドキュメント
- [【Hono入門】爆速でAPI開発ができるHonoに入門してデプロイまで学んでみよう【CloudFlare Workersを利用】 - YouTube](https://www.youtube.com/watch?v=ZXBbmU9Z1cg&t=809s)
  - 直接の参考元

# 環境構築

### honoをインストール

```cmd
npm create hono@latest
```

オプションとして、`cloudflare workers`と`npm`を指定

### cloudflare workers で使用するwranglerのインストールと導入確認：

```cmd
npm install wrangler --save-dev
npx wrangler --version
```

## 基本の書き方

```typescript
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json"; // 初期搭載ミドルウェア

const app = new Hono();

let blogPosts = [
  {
    id: "1",
    title: "Blog1",
    content: "Blog1 Posts",
  },
  {
    id: "2",
    title: "Blog2",
    content: "Blog2 Posts",
  },
  {
    id: "3",
    title: "Blog3",
    content: "Blog3 Posts",
  },
];

app.use("*", prettyJSON()); // /posts?pretty でjsonを見やすく表示可能

//基本的なget API
app.get("/posts", (c) => {
  return c.json(blogPosts); //jsonで取得
});

//動的ルーティング
app.get("/posts/:id", (c) => {
  const id = c.req.param("id"); //idを取得
  const post = blogPosts.find((post) => post.id === id); //idが一致するpostを取得

  if (post) {
    return c.json(post);
  } else {
    return c.json({ message: "Not Found" }, 404); //見つからない場合。404を返す
  }
});

//基本的なpost API
app.post("/posts", async (c) => {
  const { title, content } = await c.req.json<{
    title: string;
    content: string;
  }>(); //リクエストのbodyを取得
  const newPost = { id: String(blogPosts.length + 1), title, content }; //新しいpostを作成
  blogPosts = [...blogPosts, newPost]; //新しいpostを追加
  return c.json(newPost, 201); //新しいpostを返す
});

//基本的なput API
app.put("/posts/:id", async (c) => {
  const id = c.req.param("id");
  const index = blogPosts.findIndex((post) => post.id === id); //idが一致するpostのindexを取得
  const { title, content } = await c.req.json<{
    title: string;
    content: string;
  }>(); //リクエストのbodyを取得

  if (index === -1) {
    return c.json({ message: "Not Found" }, 404); //見つからない場合。404を返す
  }
  return c.json((blogPosts[index] = { ...blogPosts[index], title, content })); //postのtitleとcontentを更新
});

//基本的なdelete API + 動的ルーティング
app.delete("/posts/:id", async (c) => {
  const id = c.req.param("id");
  const index = blogPosts.findIndex((post) => post.id === id); //idが一致するpostのindexを取得
  const { title, content } = await c.req.json<{
    title: string;
    content: string;
  }>(); //リクエストのbodyを取得

  if (index === -1) {
    return c.json({ message: "Not Found" }, 404); //見つからない場合。404を返す
  }
  blogPosts = blogPosts.filter((post) => post.id !== id); //idが一致するpostを削除
  return c.json({ message: id + " post delete" }); //postのtitleとcontentを更新
});

export default app;

```

# ファイル分割ルーティング

## ファイル構成

```
📦src
 ┣ 📂blogs
 ┃ ┗ 📜blogs.ts
 ┗ 📜index.ts
```

## ルーティング方法

### /index.ts

```typescript
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json"; // 初期搭載ミドルウェア
import posts from "./blogs/blogs";

const app = new Hono();

app.use("*", prettyJSON()); // /posts?pretty でjsonを見やすく表示可能
app.route("/posts", posts); // /posts/ の下に各APIを生やせる

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

export default app;

```

### /blogs/blogs.ts

```typescript
import { Hono } from "hono";

const app = new Hono();

let blogPosts = [
  {
    id: "1",
    title: "Blog1",
    content: "Blog1 Posts",
  },
  {
    id: "2",
    title: "Blog2",
    content: "Blog2 Posts",
  },
  {
    id: "3",
    title: "Blog3",
    content: "Blog3 Posts",
  },
];

//基本的なget API
app.get("/", (c) => {
  return c.json(blogPosts); //jsonで取得
});

//動的ルーティング
app.get("/:id", (c) => {
  const id = c.req.param("id"); //idを取得
  const post = blogPosts.find((post) => post.id === id); //idが一致するpostを取得

  if (post) {
    return c.json(post);
  } else {
    return c.json({ message: "Not Found" }, 404); //見つからない場合。404を返す
  }
});

app.post("/", async (c) => {
  const { title, content } = await c.req.json<{
    title: string;
    content: string;
  }>(); //リクエストのbodyを取得
  const newPost = { id: String(blogPosts.length + 1), title, content }; //新しいpostを作成
  blogPosts = [...blogPosts, newPost]; //新しいpostを追加
  return c.json(newPost, 201); //新しいpostを返す
});

//基本的なput API
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const index = blogPosts.findIndex((post) => post.id === id); //idが一致するpostのindexを取得
  const { title, content } = await c.req.json<{
    title: string;
    content: string;
  }>(); //リクエストのbodyを取得

  if (index === -1) {
    return c.json({ message: "Not Found" }, 404); //見つからない場合。404を返す
  }
  return c.json((blogPosts[index] = { ...blogPosts[index], title, content })); //postのtitleとcontentを更新
});

//基本的なdelete API + 動的ルーティング
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const index = blogPosts.findIndex((post) => post.id === id); //idが一致するpostのindexを取得
  const { title, content } = await c.req.json<{
    title: string;
    content: string;
  }>(); //リクエストのbodyを取得

  if (index === -1) {
    return c.json({ message: "Not Found" }, 404); //見つからない場合。404を返す
  }
  blogPosts = blogPosts.filter((post) => post.id !== id); //idが一致するpostを削除
  return c.json({ message: id + " post delete" }); //postのtitleとcontentを更新
});

export default app;

```

# ミドルウェア例

## ディレクトリ構成

```
📦src
 ┣ 📂auth
 ┃ ┗ 📜auth.ts
 ┣ 📂blogs
 ┃ ┗ 📜blogs.ts
 ┗ 📜index.ts
```

## basic-authを実装

### /index.ts

```typescript
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json"; // 初期搭載ミドルウェア
import posts from "./blogs/blogs";
import auth from "./auth/auth";
import { basicAuth } from "hono/basic-auth"; //基本認証ミドルウェア

const app = new Hono();

app.use("*", prettyJSON()); // /posts?pretty でjsonを見やすく表示可能
app.use("/auth/*", basicAuth({ username: "admin", password: "admin" })); //auth/の下のAPIで認証ができる

app.route("/posts", posts); // /posts/ の下に各APIを生やせる
app.route("/auth", auth); // /auth/ の下に各APIを生やせる

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

export default app;

```

### /auth/auth.ts

```typescript
import { Hono } from "hono";

const app = new Hono();

app.get("/page", (c) => {
  return c.text("認証が通りました");
});

export default app;

```

## 挙動

- 対象URLを叩くとブラウザからユーザー名とパスワード入力が求められ、正しい入力をするとアクセスできる。
- 管理用ページや限定コンテンツ配信に使えそう？

# cloudflare workers にデプロイ

1. [workers and pages](https://dash.cloudflare.com/b24dc79a91bc1f0033a90f3e8553e1c0/workers-and-pages/create)にブラウザでアクセス（ログイン状態で）
2. `npm run deploy`を実行
3. 公開完了
