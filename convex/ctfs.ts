import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { type Doc } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";

const MAX_KEY_LENGTH = 300;

type StatsFields = { up: number; down: number; difficultySum: number; difficultyCount: number };

const avg = (s: { difficultySum: number; difficultyCount: number }) =>
  s.difficultyCount > 0 ? s.difficultySum / s.difficultyCount : null;

async function getChallengeStats(ctx: MutationCtx, key: string, ctfSlug: string) {
  const existing = await ctx.db
    .query("challengeStats")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (existing) return existing;
  const id = await ctx.db.insert("challengeStats", {
    key,
    ctfSlug,
    up: 0,
    down: 0,
    difficultySum: 0,
    difficultyCount: 0,
  });
  return (await ctx.db.get(id))!;
}

async function getCtfStats(ctx: MutationCtx, slug: string) {
  const existing = await ctx.db
    .query("ctfStats")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (existing) return existing;
  const id = await ctx.db.insert("ctfStats", {
    slug,
    up: 0,
    down: 0,
    difficultySum: 0,
    difficultyCount: 0,
  });
  return (await ctx.db.get(id))!;
}

/** Apply the same additive delta to a challenge doc and its CTF rollup. */
async function applyDelta(
  ctx: MutationCtx,
  challenge: Doc<"challengeStats">,
  ctf: Doc<"ctfStats">,
  delta: Partial<StatsFields>
) {
  const patch = (doc: StatsFields) => ({
    up: doc.up + (delta.up ?? 0),
    down: doc.down + (delta.down ?? 0),
    difficultySum: doc.difficultySum + (delta.difficultySum ?? 0),
    difficultyCount: doc.difficultyCount + (delta.difficultyCount ?? 0),
  });
  await ctx.db.patch(challenge._id, patch(challenge));
  await ctx.db.patch(ctf._id, patch(ctf));
}

/** Rollup stats for every CTF that has any activity (for the explorer grid). */
export const allStats = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db.query("ctfStats").collect();
    return stats.map((s) => ({
      slug: s.slug,
      up: s.up,
      down: s.down,
      difficulty: avg(s),
      ratings: s.difficultyCount,
    }));
  },
});

/** Per-challenge stats for one CTF, plus the current user's own votes/ratings. */
export const ctfChallengeStats = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const rows = await ctx.db
      .query("challengeStats")
      .withIndex("by_ctf", (q) => q.eq("ctfSlug", slug))
      .collect();

    const challenges: Record<string, { up: number; down: number; difficulty: number | null; ratings: number }> = {};
    for (const r of rows) {
      challenges[r.key] = { up: r.up, down: r.down, difficulty: avg(r), ratings: r.difficultyCount };
    }

    const myVotes: Record<string, 1 | -1> = {};
    const myRatings: Record<string, number> = {};
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const votes = await ctx.db
        .query("challengeVotes")
        .withIndex("by_user_ctf", (q) => q.eq("userId", userId).eq("ctfSlug", slug))
        .collect();
      for (const v of votes) myVotes[v.key] = v.value;
      const ratings = await ctx.db
        .query("challengeRatings")
        .withIndex("by_user_ctf", (q) => q.eq("userId", userId).eq("ctfSlug", slug))
        .collect();
      for (const r of ratings) myRatings[r.key] = r.difficulty;
    }

    const rollup = await ctx.db
      .query("ctfStats")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    return {
      challenges,
      myVotes,
      myRatings,
      summary: {
        up: rollup?.up ?? 0,
        down: rollup?.down ?? 0,
        difficulty: rollup ? avg(rollup) : null,
        ratings: rollup?.difficultyCount ?? 0,
      },
    };
  },
});

/** Cast, change or remove a vote on a challenge. value 0 removes the vote. */
export const voteChallenge = mutation({
  args: {
    ctfSlug: v.string(),
    key: v.string(),
    value: v.union(v.literal(1), v.literal(-1), v.literal(0)),
  },
  handler: async (ctx, { ctfSlug, key, value }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (key.length === 0 || key.length > MAX_KEY_LENGTH) throw new Error("Invalid challenge");

    const existing = await ctx.db
      .query("challengeVotes")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key))
      .unique();
    if ((existing?.value ?? 0) === value) return;

    const challenge = await getChallengeStats(ctx, key, ctfSlug);
    const ctf = await getCtfStats(ctx, ctfSlug);

    const delta: Partial<StatsFields> = {};
    if (existing) {
      if (existing.value === 1) delta.up = (delta.up ?? 0) - 1;
      else delta.down = (delta.down ?? 0) - 1;
    }
    if (value === 0) {
      if (existing) await ctx.db.delete(existing._id);
    } else {
      if (value === 1) delta.up = (delta.up ?? 0) + 1;
      else delta.down = (delta.down ?? 0) + 1;
      if (existing) await ctx.db.patch(existing._id, { value });
      else await ctx.db.insert("challengeVotes", { userId, ctfSlug, key, value });
    }
    await applyDelta(ctx, challenge, ctf, delta);
  },
});

/** Set or remove a difficulty rating (1-5) on a challenge. 0 removes it. */
export const rateChallenge = mutation({
  args: { ctfSlug: v.string(), key: v.string(), difficulty: v.number() },
  handler: async (ctx, { ctfSlug, key, difficulty }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (key.length === 0 || key.length > MAX_KEY_LENGTH) throw new Error("Invalid challenge");
    if (!Number.isInteger(difficulty) || difficulty < 0 || difficulty > 5)
      throw new Error("Difficulty must be an integer between 0 and 5");

    const existing = await ctx.db
      .query("challengeRatings")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key))
      .unique();
    if ((existing?.difficulty ?? 0) === difficulty) return;

    const challenge = await getChallengeStats(ctx, key, ctfSlug);
    const ctf = await getCtfStats(ctx, ctfSlug);

    const delta: Partial<StatsFields> = {};
    if (existing) {
      delta.difficultySum = (delta.difficultySum ?? 0) - existing.difficulty;
      delta.difficultyCount = (delta.difficultyCount ?? 0) - 1;
    }
    if (difficulty === 0) {
      if (existing) await ctx.db.delete(existing._id);
    } else {
      delta.difficultySum = (delta.difficultySum ?? 0) + difficulty;
      delta.difficultyCount = (delta.difficultyCount ?? 0) + 1;
      if (existing) await ctx.db.patch(existing._id, { difficulty });
      else await ctx.db.insert("challengeRatings", { userId, ctfSlug, key, difficulty });
    }
    await applyDelta(ctx, challenge, ctf, delta);
  },
});
