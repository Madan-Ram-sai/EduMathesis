import { ApiError } from "../utils/ApiError.js";

const json = async (res, what) => {
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    throw new ApiError(
      401,
      `${what} rejected the sign-in (${body.error_description || body.error || res.status})`
    );
  }
  return body;
};

async function google({ code, redirectUri }) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new ApiError(500, "Google sign-in is not configured on the server");
  }

  const tokenResponse = await json(
    await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    }),
    "Google"
  );

  const profileResponse = await json(
    await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
    }),
    "Google"
  );

  if (!profileResponse.email || !profileResponse.email_verified) {
    throw new ApiError(401, "Your Google email is not verified");
  }

  return {
    provider: "google",
    oauthId: String(profileResponse.sub),
    email: profileResponse.email,
    name: profileResponse.name,
    avatarUrl: profileResponse.picture,
  };
}

async function github({ code, redirectUri }) {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new ApiError(500, "GitHub sign-in is not configured on the server");
  }

  const tokenResponse = await json(
    await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    }),
    "GitHub"
  );

  const headers = {
    Authorization: `Bearer ${tokenResponse.access_token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "EduMathesis",
  };

  const userResponse = await json(
    await fetch("https://api.github.com/user", { headers }),
    "GitHub"
  );

  const emailsResponse = await json(
    await fetch("https://api.github.com/user/emails", { headers }),
    "GitHub"
  );

  const primary = Array.isArray(emailsResponse)
    ? emailsResponse.find((email) => email.primary && email.verified)
    : null;

  if (!primary) {
    throw new ApiError(401, "Your GitHub account has no verified primary email");
  }

  return {
    provider: "github",
    oauthId: String(userResponse.id),
    email: primary.email,
    name: userResponse.name || userResponse.login,
    avatarUrl: userResponse.avatar_url,
  };
}

export async function exchangeCodeForProfile({ provider, code, redirectUri }) {
  if (!code || !redirectUri) {
    throw new ApiError(400, "code and redirectUri are required");
  }

  const allowedOrigin = process.env.CORS_ORIGIN;
  const expectedPrefix = allowedOrigin ? allowedOrigin.replace(/\/$/, "") + "/oauth/callback/" : null;
  if (expectedPrefix && !redirectUri.startsWith(expectedPrefix)) {
    throw new ApiError(400, "Invalid redirectUri");
  }

  if (provider === "google") return google({ code, redirectUri });
  if (provider === "github") return github({ code, redirectUri });

  throw new ApiError(400, "Unsupported provider");
}
