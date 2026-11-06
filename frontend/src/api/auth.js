import http from "./http";

const data = (r) => r.data.data;

export const register = (fd) => http.post("/users/register", fd).then(data);
export const login = (body) => http.post("/users/login", body).then(data);
export const logout = () => http.post("/users/logout");
export const me = () => http.get("/users/me").then(data);
export const verifyEmail = (token) => http.get("/users/verify-email", { params: { token } });
export const resendVerification = (email) => http.post("/users/resend-verification", { email });
export const forgotPassword = (email) => http.post("/users/forgot-password", { email });
export const resetPassword = (token, newPassword) => http.post("/users/reset-password", { token, newPassword });
export const changePassword = (currentPassword, newPassword) => http.post("/users/change-password", { currentPassword, newPassword });