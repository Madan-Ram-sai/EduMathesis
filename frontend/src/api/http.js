import axios from "axios";

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });

let refreshing = null;
const skip = ["/refresh-token", "/login", "/register"];

http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const { config, response } = err;
    if (response?.status === 401 && config && !config._retry && !skip.some((p) => config.url.includes(p))) {
      config._retry = true;
      refreshing ??= http.post("/users/refresh-token").finally(() => (refreshing = null));
      try {
        await refreshing;
        return http(config);
      } catch {
        /* refresh failed, fall through */
      }
    }
    return Promise.reject(err);
  }
);

export const msg = (e) =>
  e.response?.data?.message || (e.request ? "Can't reach the server. Is it running?" : "Something went wrong");

export default http;