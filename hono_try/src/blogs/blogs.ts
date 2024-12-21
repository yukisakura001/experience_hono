//基本的なpost API
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
