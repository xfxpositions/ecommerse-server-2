import { Elysia } from "elysia";
import logger from "../logger";

const app = new Elysia();

app.onBeforeHandle((context) => {
  const method = context.request.method;
  const ip = context.headers["x-forwarded-for"] || undefined;

  logger.http(`method: ${method} ip: ${ip}`);
});

export default app;
