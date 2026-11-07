import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useScene } from "../scene/SceneContext";

export function Field({ label, icon: Icon, suffix, error, hint, as: Tag = "input", ...p }) {
  const id = useId();
  return (
    <div className={`field ${error ? "has-err" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className={`control ${Tag === "textarea" ? "area" : ""}`}>
        {Icon && <Icon size={18} className="ico" />}
        <Tag id={id} aria-invalid={!!error} {...p} />
        {suffix}
      </div>
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="err"
            className="err"
            role="alert"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {error}
          </motion.p>
        ) : (
          hint && <p className="hint-text">{hint}</p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Password input with show/hide. On the login/register pages Prof. Pi covers his eyes while it is focused. */
export function PasswordField({ onFocus, onBlur, ...props }) {
  const [show, setShow] = useState(false);
  const scene = useScene();
  return (
    <Field
      {...props}
      type={show ? "text" : "password"}
      icon={Lock}
      onFocus={(e) => {
        scene?.setMood(show ? "idle" : "hide");
        onFocus?.(e);
      }}
      onBlur={(e) => {
        scene?.setMood("idle");
        onBlur?.(e);
      }}
      suffix={
        <button
          type="button"
          className="eye"
          onClick={() => {
            setShow((s) => !s);
            scene?.setMood(show ? "hide" : "idle");
          }}
          aria-label={show ? "Hide password" : "Show password"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={show}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: "flex" }}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.span>
          </AnimatePresence>
        </button>
      }
    />
  );
}
