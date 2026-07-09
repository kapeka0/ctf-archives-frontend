"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowBigDown, ArrowBigUp, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

import DifficultyMeter from "@/components/ctf/DifficultyMeter";
import ExternalLink from "@/components/ui/external-link";
import { api } from "@/convex/_generated/api";
import { githubTreeUrl, type CtfChallenge, type CtfYear } from "@/lib/ctf/types";
import { cn } from "@/lib/utils";

const LEVELS = [1, 2, 3, 4, 5] as const;

type ChallengeStat = { up: number; down: number; difficulty: number | null; ratings: number };

type Handlers = {
  onVote: (key: string, value: 1 | -1) => void;
  onRate: (key: string, difficulty: number) => void;
};

function ChallengeRow({
  challenge,
  stat,
  myVote,
  myRating,
  h,
}: {
  challenge: CtfChallenge;
  stat: ChallengeStat | undefined;
  myVote: 1 | -1 | undefined;
  myRating: number | undefined;
  h: Handlers;
}) {
  const t = useTranslations("Ctf");
  const shownDifficulty = myRating ?? (stat?.difficulty ? Math.round(stat.difficulty) : 0);

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-1.5">
      <ExternalLink
        className="group flex min-w-0 flex-1 items-center gap-1.5"
        href={githubTreeUrl(challenge.path)}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span className="truncate font-mono text-[13px] text-foreground/90 group-hover:text-brand">
          {challenge.name}
        </span>
        <ArrowUpRight className="size-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-brand" />
      </ExternalLink>

      <div className="flex shrink-0 items-center">
        {LEVELS.map((level) => (
          <button
            aria-label={`${t("difficulty")} ${level}/5`}
            aria-pressed={myRating === level}
            className="group px-[1.5px] py-1.5"
            key={level}
            onClick={() => h.onRate(challenge.path, level)}
            type="button"
          >
            <span
              className={cn(
                "block h-3.5 w-[3px] rounded-full transition-colors",
                level <= shownDifficulty ? "bg-brand" : "bg-border group-hover:bg-brand/40"
              )}
            />
          </button>
        ))}
      </div>

      <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-border">
        <button
          aria-label={t("upvote")}
          aria-pressed={myVote === 1}
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs transition-colors hover:bg-secondary",
            myVote === 1 && "text-success"
          )}
          onClick={() => h.onVote(challenge.path, 1)}
          type="button"
        >
          <ArrowBigUp className={cn("size-3.5", myVote === 1 && "fill-current")} />
          <span className="font-mono tabular-nums">{stat?.up ?? 0}</span>
        </button>
        <button
          aria-label={t("downvote")}
          aria-pressed={myVote === -1}
          className={cn(
            "flex items-center gap-1 border-l border-border px-2 py-1 text-xs transition-colors hover:bg-secondary",
            myVote === -1 && "text-danger"
          )}
          onClick={() => h.onVote(challenge.path, -1)}
          type="button"
        >
          <ArrowBigDown className={cn("size-3.5", myVote === -1 && "fill-current")} />
          <span className="font-mono tabular-nums">{stat?.down ?? 0}</span>
        </button>
      </div>
    </div>
  );
}

function CtfBoard({ slug, years }: { slug: string; years: CtfYear[] }) {
  const t = useTranslations("Ctf");
  const data = useQuery(api.ctfs.ctfChallengeStats, { slug });
  const { isAuthenticated } = useConvexAuth();
  const voteChallenge = useMutation(api.ctfs.voteChallenge);
  const rateChallenge = useMutation(api.ctfs.rateChallenge);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    toast(t("signInToVote"));
    return false;
  };

  const h: Handlers = {
    onVote: (key, value) => {
      if (!requireAuth() || !data) return;
      const current = data.myVotes[key];
      void voteChallenge({ ctfSlug: slug, key, value: current === value ? 0 : value }).catch(() =>
        toast.error(t("voteError"))
      );
    },
    onRate: (key, difficulty) => {
      if (!requireAuth() || !data) return;
      const current = data.myRatings[key];
      void rateChallenge({
        ctfSlug: slug,
        key,
        difficulty: current === difficulty ? 0 : difficulty,
      }).catch(() => toast.error(t("voteError")));
    },
  };

  const summary = data?.summary;

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-card px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{t("average")}</span>
        <span className="flex items-center gap-2">
          <DifficultyMeter value={summary?.difficulty ?? 0} />
          <span className="font-mono text-sm">
            {summary?.difficulty != null ? summary.difficulty.toFixed(1) : "—"}
            <span className="text-muted-foreground">/5</span>
          </span>
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          {summary ? `${summary.up - summary.down >= 0 ? "+" : ""}${summary.up - summary.down} ${t("net")}` : ""}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{t("rateHint")}</span>
      </div>

      <div className="mt-10 space-y-12">
        {years.map((year) => {
          const byCategory = new Map<string, CtfChallenge[]>();
          for (const c of year.challenges) {
            const list = byCategory.get(c.category);
            if (list) list.push(c);
            else byCategory.set(c.category, [c]);
          }
          return (
            <section className="scroll-mt-24" id={`y-${year.year}`} key={year.year}>
              <div className="mb-5 flex items-baseline gap-3">
                <h2 className="font-mono text-xl font-semibold tabular-nums tracking-tight">{year.year}</h2>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {year.challenges.length} {t("challenges")}
                </span>
                {year.ctftime ? (
                  <ExternalLink
                    className="ml-auto flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-brand"
                    href={year.ctftime}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("ctftime")}
                    <ArrowUpRight className="size-3" />
                  </ExternalLink>
                ) : null}
              </div>
              <div className="space-y-6">
                {[...byCategory.entries()].map(([category, challenges]) => (
                  <div className="grid gap-3 sm:grid-cols-[8rem_1fr]" key={category}>
                    <h3 className="pt-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {category}
                      <span className="ml-1.5 text-border">{challenges.length}</span>
                    </h3>
                    <div className="space-y-1.5">
                      {challenges.map((challenge) => (
                        <ChallengeRow
                          challenge={challenge}
                          h={h}
                          key={challenge.path}
                          myRating={data?.myRatings[challenge.path]}
                          myVote={data?.myVotes[challenge.path]}
                          stat={data?.challenges[challenge.path]}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default CtfBoard;
