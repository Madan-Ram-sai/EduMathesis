import http from "./http";

const data = (r) => r.data.data;

/* ---------- auth ---------- */
export const register = (fd) => http.post("/users/register", fd).then(data);
export const login = (body) => http.post("/users/login", body).then(data);
export const logout = () => http.post("/users/logout");
export const me = () => http.get("/users/me").then(data);
export const verifyEmail = (token) => http.get("/users/verify-email", { params: { token } });
export const resendVerification = (email) => http.post("/users/resend-verification", { email });
export const forgotPassword = (email) => http.post("/users/forgot-password", { email });
export const resetPassword = (token, newPassword) => http.post("/users/reset-password", { token, newPassword });

/* OAuth: the browser only hands the provider's one-time `code` to the backend.
   The backend exchanges it for the verified profile (see backend-patch/). */
export const oauth = (body) => http.post("/users/oauth", body).then(data);

/* ---------- account ---------- */
export const changePassword = (currentPassword, newPassword) =>
  http.post("/users/change-password", { currentPassword, newPassword }).then(data);
export const updateProfile = (fd) => http.patch("/users/profile", fd).then(data);

/* ---------- teachers ---------- */
export const requestTeacher = () => http.post("/users/teacher-request").then(data);
export const searchTeachers = (q = "", limit = 20, offset = 0) =>
  http.get("/users/teachers/search", { params: { q, limit, offset } }).then(data);

/* ---------- admin ---------- */
export const teacherRequests = (status) =>
  http.get("/users/admin/teacher-requests", { params: status ? { status } : {} }).then(data);
export const reviewTeacherRequest = (id, status) =>
  http.patch(`/users/admin/teacher-requests/${id}`, { status }).then(data);
