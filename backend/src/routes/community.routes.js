import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireCommunityMember, requireRole } from "../middlewares/role.middleware.js";
import {
  createCommunity,
  generateJoinCode,
  getCommunity,
  getCommunityMembers,
  joinWithCode,
  leaveCommunity,
  listMyCommunities,
} from "../controllers/community.controller.js";

const router = Router();
router.use(verifyJWT);

router.post("/", requireRole("admin"), createCommunity);
router.get("/", listMyCommunities);
router.post("/join", joinWithCode); // keep above "/:id" routes
router.get("/:id", requireCommunityMember, getCommunity);
router.get("/:id/members", requireCommunityMember, getCommunityMembers);
router.post("/:id/join-codes", requireCommunityMember, generateJoinCode);
router.delete("/:id/leave", leaveCommunity);

export default router;