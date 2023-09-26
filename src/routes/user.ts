import { Elysia, t } from "elysia";
import User from "../models/user";
import IJwt from "../types/jwtClaim";
import jwt from "../utils/jwt";
import hashPassword from "../utils/hashPassword";
import genRandomUserId from "../utils/genRandomUserId";

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
    async ({ body }) => {
      //const { hash, saltKey } = await hashPassword.hashPassword(body.password);

      const userId = await genRandomUserId();
      console.log(userId);
      await User.create({
        username: body.username,
        password: body.password,
        email: body.email,
        userId: userId,
        name: body.name,
      })
        .then((result) => {})
        .catch((err) => {
          //console.log(err);
          throw err;
        });
      console.log("hoo");
    },
    {
      body: t.Object({
        username: t.String(),
        name: t.String(),
        password: t.String(),
        email: t.String(),
      }),
      detail: {
        tags: ["User", "Auth"],
      },
    }
  );

export default userRoutes;
