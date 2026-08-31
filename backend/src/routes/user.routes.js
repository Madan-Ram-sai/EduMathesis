import { Router } from "express";
import { registeruser,loginUser,verifyEmail,resendVerificationEmail } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registeruser
);

router.route("/login").post(loginUser);
router.route("/verify-email").get(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);

export default router;