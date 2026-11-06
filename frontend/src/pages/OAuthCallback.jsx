import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { msg } from "../api/http";
import { consumeOAuthState, isProvider, redirectUriFor } from "../utils/oauth";
import StatusOrb from "../components/ui/StatusOrb";
import Alert from "../components/ui/Alert";

/** Landing page for Google / GitHub. Checks `state`, then lets the backend swap the one-time code for a login. */
export default function OAuthCallback() {
  const { provider } = useParams();
  const [q] = useSearchParams();
  const { signInWithOAuth } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true; // codes are single-use, so never run twice (StrictMode)

    const fail = (m) => setErr(m);
    const { state, next } = consumeOAuthState();
    const code = q.get("code");

    if (q.get("error")) return fail("Sign-in was cancelled.");
    if (!isProvider(provider)) return fail("Unknown sign-in provider.");
    if (!code || !state || state !== q.get("state")) return fail("That sign-in link is invalid or expired. Please try again.");

    signInWithOAuth({ provider, code, redirectUri: redirectUriFor(provider) })
      .then(() => nav(next, { replace: true }))
      .catch((x) => fail(msg(x)));
  }, [provider, q, nav, signInWithOAuth]);

  return (
    <div className="center">
      <StatusOrb kind={err ? "bad" : "loading"} />
      {err ? (
        <>
          <h1>Couldn't sign you in</h1>
          <Alert>{err}</Alert>
          <Link to="/login" className="soft">Back to login</Link>
        </>
      ) : (
        <>
          <h1>Signing you in…</h1>
          <p>Just a moment while we finish with {provider === "github" ? "GitHub" : "Google"}.</p>
        </>
      )}
    </div>
  );
}
