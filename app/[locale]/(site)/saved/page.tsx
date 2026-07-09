"use client";

import { useQuery } from "convex/react";
import { ArrowUpRight, Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import ExternalLink from "@/components/ui/external-link";
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/routing";
import { githubTreeUrl } from "@/lib/ctf/types";

function SavedPage() {
  const t = useTranslations("Saved");
  const favorites = useQuery(api.favorites.all);

  const grouped = new Map<string, { ctfSlug: string; key: string }[]>();
  for (const f of favorites ?? []) {
    const list = grouped.get(f.ctfSlug);
    if (list) list.push(f);
    else grouped.set(f.ctfSlug, [f]);
  }

  return (
    <MaxWidthWrapper className="py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>

      {(!favorites || favorites.length === 0) ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <Bookmark className="size-10 text-muted-foreground/30" />
          <p className="max-w-sm text-lg text-muted-foreground">{t("empty")}</p>
          <Link href="/">
            <Button variant="outline" size="sm">
              {t("browseCta")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {[...grouped.entries()].map(([ctfSlug, items]) => (
            <section key={ctfSlug}>
              <div className="mb-3 flex items-center gap-2">
                <Link
                  className="font-mono text-lg font-semibold tracking-tight transition-colors hover:text-brand"
                  href={`/ctf/${ctfSlug}`}
                >
                  {ctfSlug}
                </Link>
                <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-1.5">
                {items.map((item) => {
                  const name = item.key.split("/").pop() ?? item.key;
                  return (
                    <ExternalLink
                      className="group flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 transition-colors hover:border-brand/50"
                      href={githubTreeUrl(item.key)}
                      key={item.key}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Bookmark className="size-3.5 shrink-0 fill-current text-brand" />
                      <span className="truncate font-mono text-sm text-foreground/90 group-hover:text-brand">
                        {name}
                      </span>
                      <ArrowUpRight className="ml-auto size-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-brand" />
                    </ExternalLink>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </MaxWidthWrapper>
  );
}

export default SavedPage;
