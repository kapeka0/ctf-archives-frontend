"use client";

import Image from "next/image";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Bookmark, LogOut } from "lucide-react";
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
import ExternalLink from "@/components/ui/external-link";
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
          className="ml-1 flex items-center justify-center rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          type="button"
        >
          <img
            alt=""
            className="size-7 rounded-full"
            src={`/api/avatar?name=${encodeURIComponent(username || "user")}`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center gap-2 font-normal">
          <img
            alt=""
            className="size-5 rounded-full"
            src={`/api/avatar?name=${encodeURIComponent(username || "user")}`}
          />
          <span className="max-w-40 truncate font-mono text-xs">{username || t("account")}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/saved">
            <Bookmark className="mr-2 size-4" />
            {t("savedChallenges")}
          </Link>
        </DropdownMenuItem>
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
      <nav className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border bg-background/70 py-2 pl-4 pr-2 shadow-sm backdrop-blur-md">
        <Link className="transition-opacity hover:opacity-70" href="/">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-0.5">
          <Button
            asChild
            className="size-8 rounded-full text-muted-foreground hover:text-foreground"
            size="icon"
            variant="ghost"
          >
            <ExternalLink
              href="https://github.com/kapeka0/ctf-archives-frontend"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image alt="GitHub" className="dark:invert" height={18} src="/images/icons/github.svg" width={18} />
            </ExternalLink>
          </Button>
          <ThemeToggle />
          <LangToggle />
          <Unauthenticated>
            <Link href="/sign-in">
              <Button className="ml-1 h-8 rounded-full px-3.5 text-sm" size="sm">
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
