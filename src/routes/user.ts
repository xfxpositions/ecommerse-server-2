import { Elysia, t } from "elysia";
import User from "../models/user";
import IJwt from "../types/jwtClaim";
import jwt from "../utils/jwt";

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
      const username = body.username;
      const password = body.password;

      if (!username || !password) {
        return new Response(
          JSON.stringify({
            error: "Username and password are required.",
          }),
          { status: 400 }
        );
      }

      User.findOne({ username: username, password: password })
        .then(async (user) => {
          if (user) {
            const claims: IJwt = {
              id: user._id,
              username: username,
            };
            // Sign key from claims
            const token = await jwt.signJwtKey(claims);

            // Return the token with 200 status code
            return new Response(
              JSON.stringify({
                token: token,
              }),
              { status: 200 }
            );
          } else {
            // Return an error response if authentication fails
            return new Response(
              JSON.stringify({
                error: "Invalid username or password.",
              }),
              { status: 401 }
            );
          }
        })
        //Return error and message if there is an error
        .catch((err) => {
          return new Response(
            JSON.stringify({
              error: "Some error happened while db call.",
              message: err?.message,
            }),
            { status: 401 }
          );
        });
    },
    {
      body: t.Object({ username: t.String(), password: t.String() }),
      detail: {
        tags: ["User", "Auth"],
      },
    }
  );

export default userRoutes;
