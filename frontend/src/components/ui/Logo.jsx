import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="EduMathesis home">
      <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">
        <rect width="32" height="32" rx="10" fill="var(--coral)" stroke="var(--ink)" strokeWidth="2" />
        <path d="M16 11c-2-1.6-5-2-8-1.4v11c3-.6 6-.2 8 1.4 2-1.6 5-2 8-1.4v-11c-3-.6-6-.2-8 1.4Z" fill="#fff" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M16 11v11" stroke="var(--ink)" strokeWidth="1.6" />
      </svg>
      <span>Edu<b>Mathesis</b></span>
    </Link>
  );
}