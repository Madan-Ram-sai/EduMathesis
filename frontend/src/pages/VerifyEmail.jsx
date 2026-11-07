import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import * as api from "../api/auth";
import { msg } from "../api/http";
import { isEmail } from "../utils/validate";
import { Field } from "../components/ui/Field";
import StatusOrb from "../components/ui/StatusOrb";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

export default function VerifyEmail() {
  const [q] = useSearchParams();
  const nav = useNavigate();
  const token = q.get("token");
  const [st, setSt] = useState(token ? "loading" : "bad");
  const [err, setErr] = useState(token ? "" : "This link is missing its token.");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true; // StrictMode runs effects twice; the token is single-use
    api.verifyEmail(token).then(() => setSt("ok")).catch((x) => { setSt("bad"); setErr(msg(x)); });
  }, [token]);

  const resend = async (e) => {
    e.preventDefault();
    if (!isEmail(email.trim())) return setErr("Enter the email you signed up with");
    try {
      await api.resendVerification(email.trim());
      setErr("");
      setNote("New link sent. Check your inbox ✉️");
    } catch (x) {
      setErr(msg(x));
    }
  };

  return (
    <div className="center">
      <StatusOrb kind={st} />
      {st === "loading" && <><h1>Verifying…</h1><p>Hang tight, we're checking your link.</p></>}
      {st === "ok" && (
        <>
          <h1>You're verified!</h1>
          <p>Your email is confirmed. Time to jump in.</p>
          <Button onClick={() => nav("/login")} icon={<ArrowRight size={18} />}>Continue to login</Button>
        </>
      )}
      {st === "bad" && (
        <>
          <h1>That link didn't work</h1>
          {err && <Alert>{err}</Alert>}
          {note && <Alert kind="ok">{note}</Alert>}
          <form className="form" onSubmit={resend} noValidate style={{ width: "100%", textAlign: "left" }}>
            <Field label="Get a fresh link" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
            <Button type="submit">Resend verification</Button>
          </form>
          <Link to="/login" className="soft">Back to login</Link>
        </>
      )}
    </div>
  );
}
