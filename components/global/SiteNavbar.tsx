"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { GradientAvatar } from "@outpacelabs/avatars";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import LangToggle from "@/components/global/LangToggle";
import { ThemeToggle } from "@/components/global/ThemeToggle";
import Wordmark from "@/components/global/Wordmark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/routing";

function UserMenu() {
  const t = useTranslations("Nav");
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);
  const username = viewer?.username ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="ml-1 rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          type="button"
        >
          <GradientAvatar seed={username || "guest"} size={28} radius="9999px" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center gap-2 font-normal">
          <GradientAvatar seed={username || "guest"} size={22} radius="9999px" />
          <span className="max-w-40 truncate font-mono text-xs">{username || t("account")}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => void signOut()}>
          <LogOut className="mr-2 size-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SiteNavbar() {
  const t = useTranslations("Nav");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <nav className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border bg-background/70 py-1.5 pl-4 pr-1.5 shadow-sm backdrop-blur-md">
        <Link className="transition-opacity hover:opacity-70" href="/">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          <LangToggle />
          <Unauthenticated>
            <Link href="/sign-in">
              <Button className="ml-1 h-8 rounded-full px-3.5 text-xs" size="sm">
                {t("signIn")}
              </Button>
            </Link>
          </Unauthenticated>
          <Authenticated>
            <UserMenu />
          </Authenticated>
        </div>
      </nav>
    </header>
  );
}

export default SiteNavbar;
