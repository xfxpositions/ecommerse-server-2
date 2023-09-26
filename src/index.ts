import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

const port = process.env?.PORT || 3000;

const app = new Elysia();

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

app.listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
