import { Caveat } from "next/font/google";
import { GeistMono } from "geist/font/mono";

// @ts-ignore - allow global CSS side-effect import in Next.js app directory
import "../globals.css";

import { cookies } from "next/headers";
// eslint-disable-next-line no-restricted-imports -- raw redirect: the locale prefix is built manually here
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster as HotToaster } from "react-hot-toast";

import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { i18nConfig } from "@/i18n/i18nConfig";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  if (!routing.locales.includes(locale as any)) {
    console.log("No locale");
    return redirect(`/${cookieLocale || i18nConfig.defaultLocale}/not-found`);
  }
  setRequestLocale(locale);
  return (
    <html lang={locale} className={cn(caveat.variable, GeistMono.variable)} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logos/logo.svg" type="image/svg+xml" sizes="any" />
      </head>
      <body className={cn(GeistMono.className, "h-full antialiased")}>
        <ConvexClientProvider>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <main className="relative flex min-h-screen flex-col">
                <div className="grow flex-1">{children}</div>
              </main>
              <Toaster />
              <HotToaster
                position="bottom-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "var(--color-card)",
                    color: "var(--color-card-foreground)",
                    border: "1px solid var(--color-border)",
                    fontSize: "14px",
                  },
                }}
              />
            </ThemeProvider>
          </NextIntlClientProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
