import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";

export function Field({ label, icon: Icon, suffix, error, as: Tag = "input", ...p }) {
  const id = useId();
  return (
    <div className={`field ${error ? "has-err" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="control">
        {Icon && <Icon size={18} className="ico" />}
        <Tag id={id} aria-invalid={!!error} {...p} />
        {suffix}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            className="err"
            role="alert"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PasswordField(props) {
  const [show, setShow] = useState(false);
  return (
    <Field
      {...props}
      type={show ? "text" : "password"}
      icon={Lock}
      suffix={
        <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={show}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.span>
          </AnimatePresence>
        </button>
      }
    />
  );
}