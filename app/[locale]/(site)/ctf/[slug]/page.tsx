// eslint-disable-next-line no-restricted-imports -- notFound has no i18n wrapper
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import CtfBoard from "@/components/ctf/CtfBoard";
import ExternalLink from "@/components/ui/external-link";
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";
import { Link } from "@/i18n/routing";
import { getCtfDetail, getCtfIndex } from "@/lib/ctf/data";
import { githubTreeUrl } from "@/lib/ctf/types";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const index = await getCtfIndex();
  return index.ctfs.map((ctf) => ({ slug: ctf.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const detail = await getCtfDetail(slug);
  return { title: detail ? `${detail.name} · CTF Archives` : "CTF Archives" };
}

export default async function CtfPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const detail = await getCtfDetail(slug);
  if (!detail) notFound();

  const t = await getTranslations("Ctf");
  const totalChallenges = detail.years.reduce((n, y) => n + y.challenges.length, 0);

  return (
    <MaxWidthWrapper className="py-10">
      <Link
        className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        href="/"
      >
        <ArrowLeft className="size-3.5" />
        {t("back")}
      </Link>

      <header className="mt-6 border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{detail.name}</h1>
        <p className="mt-2 font-mono text-base text-muted-foreground">
          {detail.years.length} {t("editions")}
          <span className="mx-2 text-border">·</span>
          {totalChallenges} {t("challenges")}
          <span className="mx-2 text-border">·</span>
          {detail.years[detail.years.length - 1].year}–{detail.years[0].year}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-sm">
          <ExternalLink
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-brand"
            href={githubTreeUrl(detail.name)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("viewOnGithub")}
            <ArrowUpRight className="size-3.5" />
          </ExternalLink>
        </div>

        {detail.years.length > 1 ? (
          <nav className="mt-6 flex flex-wrap gap-1.5" aria-label={t("yearJump")}>
            {detail.years.map((year) => (
              <ExternalLink
                className="rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
                href={`#y-${year.year}`}
                key={year.year}
              >
                {year.year}
              </ExternalLink>
            ))}
          </nav>
        ) : null}
      </header>

      <CtfBoard slug={detail.slug} years={detail.years} />
    </MaxWidthWrapper>
  );
}
