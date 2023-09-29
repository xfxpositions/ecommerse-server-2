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
        tags: ["Auth"],
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
        tags: ["Auth"],
      },
    }
  )
  .delete(
    "/delete/:id",
    ({ params }) => {
      if (!params.id) {
        return new Response(
          JSON.stringify({
            status: "bad request",
            detail: "id is required -> /delete/:id",
          }),
          { status: 400 }
        );
      }

      return User.findByIdAndDelete(params.id)
        .then((deletedUser) => {
          if (!deletedUser) {
            return new Response(
              JSON.stringify({
                status: "not found",
                detail: `User with ID ${params.id} not found.`,
              }),
              { status: 404 }
            );
          }

          return new Response(
            JSON.stringify({
              status: "success",
              detail: `User ${params.id} deleted.`,
            }),
            { status: 200 }
          );
        })
        .catch((error) => {
          return new Response(
            JSON.stringify({
              status: "error",
              detail: error.message, // Use error.message directly
            }),
            { status: 500 }
          );
        });
    },
    {
      detail: {
        tags: ["User"],
      },
    }
  )
  .put(
    "/update/:id",
    ({ params, body }) => {
      if (!params.id) {
        return new Response(
          JSON.stringify({
            status: "bad request",
            detail: "id is required -> /update/:id",
          }),
          { status: 400 }
        );
      }

      const updatedData = body as Record<string, any>; // Define the type of the body

      return User.findByIdAndUpdate(params.id, updatedData, { new: true })
        .then((updatedUser: any) => {
          // Specify the type for updatedUser
          if (!updatedUser) {
            return new Response(
              JSON.stringify({
                status: "not found",
                detail: `User with ID ${params.id} not found.`,
              }),
              { status: 404 }
            );
          }

          return new Response(
            JSON.stringify({
              status: "success",
              detail: `User ${params.id} updated.`,
              result: updatedUser,
            }),
            { status: 200 }
          );
        })
        .catch((error) => {
          return new Response(
            JSON.stringify({
              status: "error",
              detail: error.message,
            }),
            { status: 500 }
          );
        });
    },
    {
      detail: {
        tags: ["User"],
      },
    }
  )
  .get(
    "/findbyid/:id",
    ({ params }) => {
      if (!params.id) {
        return new Response(
          JSON.stringify({
            status: "bad request",
            detail: "id is required -> /findbyid/:id",
          }),
          { status: 400 }
        );
      }

      return User.findById(params.id)
        .then((user) => {
          if (!user) {
            return new Response(
              JSON.stringify({
                status: "not found",
                detail: `User with ID ${params.id} not found.`,
              }),
              { status: 404 }
            );
          }

          // delete password and passwordSaltKey
          user.password = "";
          user.passwordSalt = "";

          return new Response(
            JSON.stringify({
              status: "success",
              detail: `User found with ID ${params.id}`,
              result: user,
            }),
            { status: 200 }
          );
        })
        .catch((error) => {
          return new Response(
            JSON.stringify({
              status: "error",
              detail: error.message,
            }),
            { status: 500 }
          );
        });
    },
    {
      detail: {
        tags: ["User"],
      },
    }
  )
  .get(
    "/findone",
    ({ query }) => {
      const filter: { [key: string]: any } = {};

      const allowedFields = ["email", "userId", "name", "username", "phone"];

      // Iterate over the allowed fields and add them to the filter if they exist in the query
      allowedFields.forEach((field) => {
        if (query[field]) {
          filter[field] = query[field];
        }
      });

      return User.findOne(filter)
        .then((user) => {
          if (!user) {
            return new Response(
              JSON.stringify({
                status: "not found",
                detail: "User not found with the provided criteria.",
              }),
              { status: 404 }
            );
          }

          // delete password and passwordSaltKey
          user.password = "";
          user.passwordSalt = "";

          return new Response(
            JSON.stringify({
              status: "success",
              detail: "User found.",
              result: user,
            }),
            { status: 200 }
          );
        })
        .catch((error) => {
          return new Response(
            JSON.stringify({
              status: "error",
              detail: error.message,
            }),
            { status: 500 }
          );
        });
    },
    {
      detail: {
        tags: ["User"],
      },
    }
  );

export default userRoutes;
