import { Elysia, t } from "elysia";

const userRoutes = new Elysia({ prefix: "/user" })
  .post(
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
        tags: ["User", "Auth"],
      },
    }
  )
  .post(
    "/register",
    ({ body }) => {
      // fake register
    },
    {
      body: t.Object({ username: t.String(), password: t.String() }),
      detail: {
        tags: ["User", "Auth"],
      },
    }
  );

export default userRoutes;
