import { Hono } from "hono";
import { stream } from "hono/streaming";
import { getFile } from "@/features/files/utils";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono().get("/:fileId", sessionMiddleware, async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return stream(c, async (stream) => {
    const file = await getFile(c.req.param().fileId);

    for await (const chunk of file) {
      stream.write(chunk);
    }
  });
});

export default app;
