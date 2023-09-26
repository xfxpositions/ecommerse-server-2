import jwt from "../utils/jwt";
import { Elysia } from "elysia";
import { URL } from "url";

const app = new Elysia();

// Define the routes that should be ignored by the auth middleware
const ignoredRoutes = ["/v1/user/login", "/v1/user/register"];

// check if rsa keys created
app.onStart(async () => {
  await jwt.checkRsaKeys();
});

app.onRequest(async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;
  // Check if the current route is in the ignoredRoutes list
  console.log(path);
  if (ignoredRoutes.includes(path)) {
    // If the route is in the ignoredRoutes list, simply return without performing the auth check
    return;
  }

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
  }
});

export default app;
