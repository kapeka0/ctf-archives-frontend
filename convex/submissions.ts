import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const MAX = { name: 100, year: 12, url: 300, notes: 500, categories: 12, category: 30 };

/** The most recently submitted CTFs. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("submissions").order("desc").take(60);
    return rows.map((r) => ({
      id: r._id,
      name: r.name,
      year: r.year,
      url: r.url ?? null,
      categories: r.categories,
      notes: r.notes ?? null,
    }));
  },
});

/** Submit a CTF. No account required. */
export const submit = mutation({
  args: {
    name: v.string(),
    year: v.string(),
    url: v.optional(v.string()),
    categories: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await getAuthUserId(ctx)) ?? undefined;

    const name = args.name.trim();
    const year = args.year.trim();
    if (!name || name.length > MAX.name) throw new Error("Invalid name");
    if (!/^\d{4}$/.test(year)) throw new Error("Year must be four digits");

    const url = args.url?.trim() || undefined;
    if (url && !/^https?:\/\//.test(url)) throw new Error("URL must start with http(s)://");
    if (url && url.length > MAX.url) throw new Error("URL too long");

    const notes = args.notes?.trim() || undefined;
    if (notes && notes.length > MAX.notes) throw new Error("Notes too long");

    const categories = [
      ...new Set(args.categories.map((c) => c.trim().toLowerCase()).filter((c) => c && c.length <= MAX.category)),
    ].slice(0, MAX.categories);

    return await ctx.db.insert("submissions", { userId, name, year, url, categories, notes });
  },
});
