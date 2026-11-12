import crypto from "crypto";
import { prisma } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { int, str } from "../utils/validate.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const makeCode = () => Array.from({ length: 8 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join("");
const personSelect = { id: true, name: true, username: true, avatarUrl: true, role: true };

export const createCommunityService = async (admin, { name, description }) => {
  const data = { name: str(name, "name", { min: 2, max: 100 }), description: str(description, "description", { max: 500, optional: true }), createdBy: admin.id };
  return prisma.$transaction(async (tx) => {
    const community = await tx.community.create({ data });
    await tx.communityMember.create({ data: { communityId: community.id, userId: admin.id } });
    return community;
  });
};

export const listCommunitiesForUserService = async (user, q) => {
  const search = q ? { name: { contains: q, mode: "insensitive" } } : {};
  let rows;
  if (user.role === "admin") {
    rows = await prisma.community.findMany({
      where: { deletedAt: null, ...search },
      orderBy: { name: "asc" },
    });
  } else {
    const memberships = await prisma.communityMember.findMany({
      where: { userId: user.id },
      select: { communityId: true },
    });
    rows = memberships.length
      ? await prisma.community.findMany({
          where: {
            id: { in: memberships.map(({ communityId }) => communityId) },
            deletedAt: null,
            ...search,
          },
          orderBy: { name: "asc" },
        })
      : [];
  }

  const counts = rows.length
    ? await prisma.communityMember.groupBy({
        by: ["communityId"],
        where: { communityId: { in: rows.map(({ id }) => id) } },
        _count: { _all: true },
      })
    : [];
  const memberCounts = new Map(counts.map(({ communityId, _count }) => [communityId, _count._all]));
  return rows.map((community) => ({
    ...community,
    memberCount: memberCounts.get(community.id) ?? 0,
  }));
};

export const getCommunityDetailsService = async (community, membership) => {
  const memberCount = await prisma.communityMember.count({ where: { communityId: community.id } });
  return { ...community, memberCount, joinedAt: membership?.joinedAt ?? null };
};

export const listMembersService = async (communityId, { role, q }, { page, limit, skip }) => {
  if (role && !["student", "teacher", "admin"].includes(role)) throw new ApiError(400, "role must be student, teacher or admin");
  const memberships = await prisma.communityMember.findMany({
    where: { communityId },
    select: { userId: true, joinedAt: true },
  });
  const joinedAtByUserId = new Map(memberships.map(({ userId, joinedAt }) => [userId, joinedAt]));
  const userIds = memberships.map(({ userId }) => userId);
  const where = {
    id: { in: userIds },
    deletedAt: null,
    ...(role ? { role } : {}),
    ...(q?.trim() ? { name: { contains: q.trim(), mode: "insensitive" } } : {}),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: personSelect, orderBy: { name: "asc" }, skip, take: limit }),
    prisma.user.count({ where }),
  ]);
  return {
    members: users.map((user) => ({ ...user, joinedAt: joinedAtByUserId.get(user.id) })),
    total,
    page,
    limit,
  };
};

export const createJoinCodeService = async (user, community, { expiresInDays, maxUses }) => {
  const days = int(expiresInDays, "expiresInDays", { min: 1, max: 90, def: 7 });
  const uses = int(maxUses, "maxUses", { min: 1, max: 1000, def: null });
  const expiresAt = new Date(Date.now() + days * 86400000);

  for (let i = 0; i < 5; i++) {
    try {
      const inv = await prisma.inviteLink.create({
        data: {
          communityId: community.id,
          createdBy: user.id,
          token: makeCode(),
          expiresAt,
          maxUses: uses,
          useCount: 0,
        },
      });
      return { code: inv.token, expiresAt: inv.expiresAt, maxUses: inv.maxUses };
    } catch (e) {
      if (e.code !== "P2002") throw e; // unique clash on the random code: try another
    }
  }
  throw new ApiError(500, "Could not generate a code, please try again");
};

export const joinCommunityByCodeService = async (user, rawCode) => {
  const code = str(rawCode, "code", { min: 4, max: 32 }).toUpperCase().replace(/\s+/g, "");
  try {
    return await prisma.$transaction(async (tx) => {
      const inv = await tx.inviteLink.findUnique({ where: { token: code } });
      if (!inv) throw new ApiError(404, "That code isn't valid");
      if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) throw new ApiError(410, "This code has expired");
      if (inv.maxUses != null && inv.useCount >= inv.maxUses) throw new ApiError(410, "This code has reached its limit");

      const community = await tx.community.findFirst({
        where: { id: inv.communityId, deletedAt: null },
      });
      if (!community) throw new ApiError(404, "This community no longer exists");
      const membership = await tx.communityMember.findFirst({
        where: { communityId: community.id, userId: user.id },
      });
      if (membership) throw new ApiError(409, "You're already in this community");

      const { count } = await tx.inviteLink.updateMany({
        where: {
          id: inv.id,
          ...(inv.maxUses != null ? { useCount: { lt: inv.maxUses } } : {}),
        },
        data: { useCount: { increment: 1 } },
      });
      if (count !== 1) throw new ApiError(410, "This code has reached its limit");
      await tx.communityMember.create({ data: { communityId: community.id, userId: user.id } });
      return community;
    });
  } catch (e) {
    if (e.code === "P2002") throw new ApiError(409, "You're already in this community");
    throw e;
  }
};

export const leaveCommunityService = async (user, communityId) => {
  const { count } = await prisma.communityMember.deleteMany({
    where: { communityId, userId: user.id },
  });
  if (!count) throw new ApiError(404, "You are not a member of this community");
};
