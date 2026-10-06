import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { getActiveUserById } from "../repositories/user.repository.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  try {
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decodedToken?.id;

    const user = await getActiveUserById(userId);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const authorizeRoles = (...roles) => {
  return (req, _, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user?.role || "unauthenticated"}' is not authorized to access this resource`);
    }
    next();
  };
};

