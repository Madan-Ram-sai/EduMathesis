import { ApiError } from "./ApiError.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const assertUuid = (v, label = "id") => {
  if (typeof v !== "string" || !UUID.test(v)) throw new ApiError(400, `Invalid ${label}`);
  return v;
};

export const str = (v, label, { min = 1, max = 5000, optional = false } = {}) => {
  if (v == null || v === "") {
    if (optional) return null;
    throw new ApiError(400, `${label} is required`);
  }
  const s = String(v).trim();
  if (s.length < min || s.length > max) throw new ApiError(400, `${label} must be ${min}-${max} characters`);
  return s;
};

export const int = (v, label, { min, max, def = null } = {}) => {
  if (v == null || v === "") return def;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new ApiError(400, `${label} must be a whole number between ${min} and ${max}`);
  return n;
};

export const paging = (q) => {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(q.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};
