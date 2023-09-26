import { Elysia, t } from "elysia";

const userRoutes = new Elysia({ prefix: "/user" }).post(
  "/login",
  ({ body }) => {
    if (body.username == "Josef") {
      return new Response("OK", { status: 200 });
    } else {
      return new Response("Unauthorized", { status: 401 });
    }
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    detail: {
      tags: ["Auth"],
    },
  }
);

export default userRoutes;
