import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { assertUuid, paging } from "../utils/validate.js";
import {
  createCommunityService,
  createJoinCodeService,
  getCommunityDetailsService,
  joinCommunityByCodeService,
  leaveCommunityService,
  listCommunitiesForUserService,
  listMembersService,
} from "../services/community.service.js";

const ok = (res, code, data, message) => res.status(code).json(new ApiResponse(code, data, message));

export const createCommunity = asyncHandler(async (req, res) => {
  ok(res, 201, await createCommunityService(req.user, req.body ?? {}), "Community created");
});

export const listMyCommunities = asyncHandler(async (req, res) => {
  ok(res, 200, await listCommunitiesForUserService(req.user, req.query.q?.toString().trim()), "OK");
});

export const getCommunity = asyncHandler(async (req, res) => {
  ok(res, 200, await getCommunityDetailsService(req.community, req.membership), "OK");
});

export const getCommunityMembers = asyncHandler(async (req, res) => {
  const { role, q } = req.query;
  ok(res, 200, await listMembersService(req.community.id, { role, q }, paging(req.query)), "OK");
});

export const generateJoinCode = asyncHandler(async (req, res) => {
  if (!req.isTeacherHere) throw new ApiError(403, "Only teachers of this community can create join codes");
  ok(res, 201, await createJoinCodeService(req.user, req.community, req.body ?? {}), "Join code created");
});

export const joinWithCode = asyncHandler(async (req, res) => {
  ok(res, 200, await joinCommunityByCodeService(req.user, req.body?.code), "You joined the community");
});

export const leaveCommunity = asyncHandler(async (req, res) => {
  await leaveCommunityService(req.user, assertUuid(req.params.id, "community id"));
  ok(res, 200, {}, "You left the community");
});
