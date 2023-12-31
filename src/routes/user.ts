import { Elysia, t } from "elysia";
import User from "../models/user";
import IJwt from "../types/jwtClaim";
import jwt from "../utils/jwt";
import hashPassword from "../utils/hashPassword";
import genRandomUserId from "../utils/genRandomUserId";
import hashPassword from "../utils/hashPassword";

const userRoutes = new Elysia({ prefix: "/user" })
  .post(
    "/login",
    async ({ body }) => {
      console.log("finding user");
      const user = await User.findOne({ username: body.username });

      const sfalseResponse = new Response(
        JSON.stringify({
          status: "unauthorized",
          details: "User not found or wrong password",
        }),
        { status: 401 }
      );

      if (!user) {
        console.log("user not found");
        return sfalseResponse;
      }

      // compare body and user passwords
      const verifyResult = await hashPassword.verifyHash(
        body.password,
        user.password,
        user.passwordSalt || ""
      );
      // const verifyResult = await user.verifyHash(body.password);
      // if (!verifyResult) {
      //   console.log("verification fault");
      //   return sfalseResponse;
      // }

      // return token if verification success
      const jwtClaims: IJwt = {
        id: user.userId.toString(),
        username: user.username,
      };
      const token = jwt.signJwtKey(jwtClaims);

      return new Response(
        JSON.stringify({
          status: "success",
          details: "user logged in successfully",
          token: token,
        })
      );
    },
    {
      detail: { tags: ["Auth"] },
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )
  // .post(
  //   "/login",
  //   async ({ body }) => {
  //     console.log("finding");
  //     await User.findOne({ username: body.username }).then(async (user) => {
  //       console.log("finded");
  //       if (!user) {
  //         console.log("haydaa");
  //         return new Response(
  //           JSON.stringify({
  //             status: "Unauthorized",
  //             details: "Wrong password or user not found",
  //           }).toString(),
  //           { status: 401 }
  //         );
  //       }
  //       // compare passwords
  //       const verifyResult = await user.verifyHash(body.password);
  //       console.log("verifyResult", verifyResult);
  //       if (!verifyResult) {
  //         return new Response(
  //           JSON.stringify({
  //             status: "Unauthorized",
  //             details: "Wrong password or user not found",
  //           }),
  //           {
  //             status: 401,
  //           }
  //         );
  //       } else {
  //         console.log("burda");
  //         const jwtResponse: IJwt = {
  //           id: user.userId.toString(),
  //           username: user.username,
  //         };

  //         const token = await jwt.signJwtKey(jwtResponse);
  //         return new Response(
  //           JSON.stringify({
  //             status: "success",
  //             detail: "user loggined successfully",
  //             token: token,
  //           }),
  //           { status: 200 }
  //         );
  //       }
  //     });
  //   },
  //   {
  //     body: t.Object({
  //       username: t.String(),
  //       password: t.String(),
  //     }),
  //     detail: {
  //       tags: ["Auth"],
  //     },
  //   }
  // )
  .post(
    "/register",
    async ({ body }) => {
      const { hash, saltKey } = await hashPassword.hashPassword(body.password);

      const userId = await genRandomUserId();
      console.log("userid", userId);
      await User.create({
        username: body.username,
        password: hash,
        email: body.email,
        userId: userId,
        name: body.name,
      })
        .then((result) => {
          console.trace("kirwe");
          return new Response(
            JSON.stringify({
              status: "success",
              details: "User created",
            })
          );
        })
        .catch((err) => {
          console.trace(err);
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
  )
  .get(
    "/find",
    ({ query }) => {
      // Define the filter object
      const filter: { [key: string]: any } = {};

      // Define the fields you want to allow for filtering (excluding password and passwordSalt)
      const allowedFields = ["email", "userId", "name", "username", "phone"];

      // Iterate over the allowed fields and add them to the filter if they exist in the query
      allowedFields.forEach((field) => {
        if (query[field] !== null && query[field] !== undefined) {
          // Added this line
          // Use a case-insensitive regex for partial matching
          const regex = new RegExp(query[field], "i");
          filter[field] = regex;
        }
      });
      // Query the users based on the filter
      return User.find(filter)
        .then((users) => {
          if (!users || users.length === 0) {
            return new Response(
              JSON.stringify({
                status: "not found",
                detail: "No users found with the provided criteria.",
              }),
              { status: 404 }
            );
          }

          // Exclude password and passwordSalt fields from each user
          const filteredUsers = users.map((user) => {
            user.password = "";
            user.passwordSalt = "";
            return user;
          });

          return new Response(
            JSON.stringify({
              status: "success",
              detail: "Users found.",
              result: filteredUsers,
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
    { detail: { tags: ["User"] } }
  )
  .get(
    "/list",
    async ({ query }) => {
      const defaultPagesize = 20;
      const maxPagesize = 50;

      const pageSizeInt = parseInt(query.pagesize as string) || defaultPagesize;
      const pageInt = parseInt(query.page as string) || 1;

      const pageSize = Math.min(pageSizeInt, maxPagesize);

      const skipCount = (pageInt - 1) * pageSize;

      try {
        const users = await User.find({}, null, {
          skip: skipCount,
          limit: pageSize,
        });

        if (!users || users.length === 0) {
          return new Response(
            JSON.stringify({
              status: "not found",
              detail: "No users found.",
            }),
            { status: 404 }
          );
        }

        // Exclude password and passwordSalt fields from each user
        const filteredUsers = users.map((user) => {
          user.password = "";
          user.passwordSalt = "";
          return user;
        });

        return new Response(
          JSON.stringify({
            status: "success",
            detail: "Users found.",
            result: filteredUsers,
          }),
          { status: 200 }
        );
      } catch (error: any) {
        return new Response(
          JSON.stringify({
            status: "error",
            detail: error.message,
          }),
          { status: 500 }
        );
      }
    },
    { detail: { tags: ["User"] } }
  );

export default userRoutes;
