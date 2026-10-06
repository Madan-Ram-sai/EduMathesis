import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  oauthLogin,
  refreshSession,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  updateAvatar,
  changePassword,
  requestTeacherRole,
  getTeacherRequests,
  reviewTeacherRequest,
  searchTeachers,
  getUserById,
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/verify-email").get(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);
router.route("/login").post(loginUser);
router.route("/oauth").post(oauthLogin);
router.route("/refresh-token").post(refreshSession);
router.route("/logout").post(logoutUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

// ==========================================
// PROTECTED ROUTES (AUTHENTICATED USERS)
// ==========================================
router.use(verifyJWT);

router.route("/me").get(getUserProfile);

router.route("/profile").patch(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateUserProfile
);

router.route("/avatar").patch(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateAvatar
);

router.route("/change-password").post(changePassword);
router.route("/teacher-request").post(requestTeacherRole);
router.route("/teachers/search").get(searchTeachers);
router.route("/:id").get(getUserById);

// ==========================================
// ADMIN-ONLY ROUTES
// ==========================================
router
  .route("/admin/teacher-requests")
  .get(authorizeRoles("admin"), getTeacherRequests);

router
  .route("/admin/teacher-requests/:id")
  .patch(authorizeRoles("admin"), reviewTeacherRequest);

export default router;