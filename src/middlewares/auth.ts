import jwt from "../utils/jwt";
import { Elysia } from "elysia";

const app = new Elysia();

//check if rsa keys created
app.onStart(async () => {
  await jwt.checkRsaKeys();
});
app.onRequest(async (context) => {
  // Check if context.headers exists and if authorization is present
  if (!context.headers || !context.headers["authorization"]) {
    // Handle the case where authorization is missing
    return new Response(
      JSON.stringify({
        status: "unauthorized",
        message: "Authorization header missing",
      }),
      { status: 401 }
    );
  }

  const authorization: string = context.headers["authorization"];
  const tokenPrefix = "Bearer ";

  if (!authorization.startsWith(tokenPrefix)) {
    // Handle the case where the authorization header is not in the expected format
    return new Response(
      JSON.stringify({
        status: "unauthorized",
        message: "Invalid authorization header format",
      }),
      { status: 401 }
    );
  }

  const token: string = authorization.substring(tokenPrefix.length); // get token from Bearer ${token}
  console.debug(`token: ${token}`);
  try {
    await jwt.verifyJwt(token); // try to verify
  } catch (err: any) {
    console.debug(`error while verifying err:${err?.code}`);

    return new Response(
      JSON.stringify({ status: "unauthorized", message: err?.message }),
      { status: 401 }
    );

    // if err, return 401 and error
  }
});

export default app;
