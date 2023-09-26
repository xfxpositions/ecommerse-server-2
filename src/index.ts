import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import userRoutes from "./routes/user";
import loggerMiddleWare from "./middlewares/logger";

const port = process.env?.PORT || 3000;

const app = new Elysia();

app.use(loggerMiddleWare);

app.get("/", () => {
  return new Response("Hello!");
});

app.use(
  swagger({
    path: "/doc",
    documentation: {
      info: {
        title: "E-Commerse documentation",
        version: process.env.npm_package_version,
      },
      tags: [
        { name: "default", description: "General endpoints" },
        { name: "Auth", description: "Authentication endpoints" },
        { name: "User", description: "User endpoints" },
      ],
    },
  })
);

app.group("/v1", (app) => app.use(userRoutes));

app.listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
