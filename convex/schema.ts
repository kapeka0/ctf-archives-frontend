import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // One vote per user per challenge: +1 (upvote) or -1 (downvote).
  challengeVotes: defineTable({
    userId: v.id("users"),
    ctfSlug: v.string(),
    key: v.string(), // challenge path, unique across the archive
    value: v.union(v.literal(1), v.literal(-1)),
  })
    .index("by_user_key", ["userId", "key"])
    .index("by_user_ctf", ["userId", "ctfSlug"]),

  // One difficulty rating (1-5) per user per challenge.
  challengeRatings: defineTable({
    userId: v.id("users"),
    ctfSlug: v.string(),
    key: v.string(),
    difficulty: v.number(),
  })
    .index("by_user_key", ["userId", "key"])
    .index("by_user_ctf", ["userId", "ctfSlug"]),

  // Denormalized aggregates per challenge.
  challengeStats: defineTable({
    key: v.string(),
    ctfSlug: v.string(),
    up: v.number(),
    down: v.number(),
    difficultySum: v.number(),
    difficultyCount: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_ctf", ["ctfSlug"]),

  // Rollup across every challenge in a CTF, so lists stay cheap to render.
  ctfStats: defineTable({
    slug: v.string(),
    up: v.number(),
    down: v.number(),
    difficultySum: v.number(),
    difficultyCount: v.number(),
  }).index("by_slug", ["slug"]),

  // User-submitted CTFs (no account required; queried by _creationTime order).
  submissions: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    year: v.string(),
    url: v.optional(v.string()),
    categories: v.array(v.string()),
    notes: v.optional(v.string()),
  }),
});
