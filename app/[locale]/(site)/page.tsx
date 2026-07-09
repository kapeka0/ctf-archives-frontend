import { ArrowUpRight, Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import CtfExplorer from "@/components/ctf/CtfExplorer";
import { Button } from "@/components/ui/button";
import ExternalLink from "@/components/ui/external-link";
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";
import { Link } from "@/i18n/routing";
import { getCtfIndex } from "@/lib/ctf/data";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const index = await getCtfIndex();

  const ledger = [
    { value: index.stats.ctfs, label: t("ctfs") },
    { value: index.stats.events, label: t("events") },
    { value: index.stats.challenges, label: t("challenges") },
  ];

  return (
    <MaxWidthWrapper className="py-14 sm:py-20">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-pretty text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {t("titleLead")}{" "}
          <span className="font-mono font-medium">
            <span className="text-brand">{"{"}</span>
            {t("titleFlag")}s
            <span className="text-brand">{"}"}</span>
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-xl leading-relaxed text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/submit">
            <Button className="gap-1.5 rounded-full text-sm" size="sm">
              <Plus className="size-4" />
              {t("submitCta")}
            </Button>
          </Link>
          <ExternalLink
            className="flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            href="#explore"
          >
            {t("filterArchive")}
            <ArrowUpRight className="size-3.5" />
          </ExternalLink>
        </div>

        <dl className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-base">
          {ledger.map((stat, i) => (
            <div className="flex items-baseline gap-2" key={stat.label}>
              {i > 0 ? <span className="mr-4 hidden h-4 w-px bg-border sm:inline-block" /> : null}
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-semibold tabular-nums text-foreground">{stat.value.toLocaleString()}</dd>
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </dl>
      </section>

      <hr className="my-12 border-border" id="explore" />

      <CtfExplorer ctfs={index.ctfs} />
    </MaxWidthWrapper>
  );
}
