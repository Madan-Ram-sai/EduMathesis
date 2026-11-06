/**
 * Redirect-based OAuth (authorization-code flow) for Google + GitHub.
 *
 * 1. startOAuth() sends the browser to the provider with a random `state`.
 * 2. The provider redirects back to /oauth/callback/:provider?code=...&state=...
 * 3. pages/OAuthCallback.jsx posts { provider, code, redirectUri } to POST /users/oauth.
 *    The BACKEND swaps the code for the verified profile (it holds the client secret).
 *
 * Needed in the frontend .env:
 *   VITE_GOOGLE_CLIENT_ID=...
 *   VITE_GITHUB_CLIENT_ID=...
 */
const PROVIDERS = {
  google: {
    label: "Google",
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    params: { response_type: "code", scope: "openid email profile", prompt: "select_account" },
  },
  github: {
    label: "GitHub",
    url: "https://github.com/login/oauth/authorize",
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
    params: { scope: "read:user user:email" },
  },
};

export const redirectUriFor = (provider) => `${window.location.origin}/oauth/callback/${provider}`;
export const isProvider = (p) => Object.hasOwn(PROVIDERS, p);

export function startOAuth(provider, next = "/") {
  const cfg = PROVIDERS[provider];
  if (!cfg) throw new Error("Unknown sign-in provider");
  if (!cfg.clientId) throw new Error(`${cfg.label} sign-in isn't configured yet. Add its client id to your .env file.`);

  const state = crypto.randomUUID();
  try {
    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem("oauth_next", next);
  } catch {
    throw new Error("Your browser is blocking storage, so social sign-in can't continue.");
  }

  const u = new URL(cfg.url);
  u.searchParams.set("client_id", cfg.clientId);
  u.searchParams.set("redirect_uri", redirectUriFor(provider));
  u.searchParams.set("state", state);
  Object.entries(cfg.params).forEach(([k, v]) => u.searchParams.set(k, v));
  window.location.assign(u.toString());
}

export function consumeOAuthState() {
  try {
    const state = sessionStorage.getItem("oauth_state");
    const next = sessionStorage.getItem("oauth_next") || "/";
    sessionStorage.removeItem("oauth_state");
    sessionStorage.removeItem("oauth_next");
    return { state, next };
  } catch {
    return { state: null, next: "/" };
  }
}
