import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import userRoutes from "./routes/user";
import loggerMiddleWare from "./middlewares/logger";
import authMiddleWare from "./middlewares/auth";
import dbConnect from "./db/connect";
import logger from "./logger";

const port = process.env?.PORT || 3000;

const app = new Elysia();

app.onError(({ code, error }) => {
  const response_text = JSON.stringify({
    error: { code: code, message: error.toString() },
  });
  if (code == "VALIDATION") {
    return new Response(error, {
      status: 400,
    });
  }
  return new Response(response_text, {
    headers: { "Content-Type": "application/json" },
    status: 500,
  });
});

// log
app.onStart(() => {
  logger.info(
    `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});

// connect to database
app.onStart(() => {
  dbConnect();
});

app.use(loggerMiddleWare);
//app.use(authMiddleWare);

app.get("/", () => {
  return new Response("Hello!");
});

app.use(
  swagger({
    path: "/doc",
    documentation: {
      info: {
        title: "E-Commerse documentation",
        version: process.env.npm_package_version || "unknown version",
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
