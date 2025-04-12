import { Hono } from "hono";
import { handle } from "hono/vercel";

import members from "@/features/members/server/route";
import workspaces from "@/features/workspaces/server/route";
import projects from "@/features/projects/server/route";
import tasks from "@/features/tasks/server/route";
import files from "@/features/files/server/route";

const app = new Hono().basePath("/api");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/jira/members", members)
  .route("/jira/workspaces", workspaces)
  .route("/jira/projects", projects)
  .route("/jira/tasks", tasks)
  .route("/jira/files", files);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
