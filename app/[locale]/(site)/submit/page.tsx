import { getTranslations, setRequestLocale } from "next-intl/server";

import SubmitForm from "@/components/ctf/SubmitForm";
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Submit" });
  return { title: `${t("title")} · CTF Archives` };
}

export default async function SubmitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Submit");

  return (
    <MaxWidthWrapper className="max-w-xl py-14">
      <p className="font-mono text-xs tracking-wider text-muted-foreground">
        {"// "}
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-2 mb-8 text-lg text-muted-foreground">{t("subtitle")}</p>
      <SubmitForm />
    </MaxWidthWrapper>
  );
}
