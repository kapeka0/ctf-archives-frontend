"use client";

// eslint-disable-next-line no-restricted-imports -- useParams has no locale-aware equivalent
import { useParams } from "next/navigation";
import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/routing";

const LANGS = [
  { code: "en", flag: "/images/flags/united-kingdom.svg" },
  { code: "es", flag: "/images/flags/spain.svg" },
  { code: "zh", flag: "/images/flags/china.svg" },
  { code: "ko", flag: "/images/flags/south-korea.svg" },
] as const;

export default function LangToggle() {
  const t = useTranslations("Global");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const changeLanguage = (locale: string) => {
    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      { pathname, params },
      { locale: locale }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-8 rounded-full text-muted-foreground hover:text-foreground" variant="ghost" size="icon">
          <Languages className="h-[1.1rem] w-[1.1rem]" />
          <span className="sr-only">{t("lang")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGS.map(({ code, flag }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code)}
            className="cursor-pointer flex items-center gap-2 flex-nowrap"
          >
            <Avatar className="size-6">
              <AvatarImage src={flag} />
            </Avatar>
            {t(code)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
