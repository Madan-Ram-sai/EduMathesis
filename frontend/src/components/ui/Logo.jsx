import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="EduMathesis home">
      <span className="mark">π</span>
      <b>EduMathesis</b>
    </Link>
  );
}
