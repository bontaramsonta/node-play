import http from "node:http";
import { parse } from "url";
import env from "./env.ts";

const HOST = "localhost";
const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const url = parse(req.url!, true);

  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(`<a href="/login">Login with Google</a>`);
  }

  if (url.pathname === "/login") {
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", env.CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", env.REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");

    res.writeHead(302, { Location: authUrl.toString() });
    return res.end();
  }

  if (url.pathname === "/callback") {
    const code = url.query.code as string | undefined;
    if (!code) {
      res.writeHead(400);
      return res.end("Missing code");
    }

    // Step 1: Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.CLIENT_ID,
        client_secret: env.CLIENT_SECRET,
        redirect_uri: env.REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    const idToken = tokenData.id_token;
    const accessToken = tokenData.access_token;

    // Step 2: Decode ID token (optional, or use /userinfo endpoint)
    const userInfoRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const userInfo = await userInfoRes.json();

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify(
        {
          user: userInfo,
          access_token: accessToken,
          id_token: idToken,
        },
        null,
        2,
      ),
    );
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
