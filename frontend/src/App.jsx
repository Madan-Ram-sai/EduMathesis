import { Navigate, Route, Routes } from "react-router-dom";
import { GuestOnly, RequireAuth, RequireRole } from "./routes/guards";
import AuthLayout from "./components/auth/AuthLayout";
import AppShell from "./components/app/AppShell";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuthCallback from "./pages/OAuthCallback";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Teachers from "./pages/Teachers";
import TeacherRequests from "./pages/TeacherRequests";
import BecomeTeacher from "./pages/BecomeTeacher";

export default function App() {
  return (
    <Routes>
      {/* public / auth pages */}
      <Route element={<AuthLayout />}>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/callback/:provider" element={<OAuthCallback />} />
      </Route>

      {/* signed-in app */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/become-teacher" element={<BecomeTeacher />} />
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/admin/teacher-requests" element={<TeacherRequests />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
