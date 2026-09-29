"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, House, Newspaper, UserRound } from "lucide-react";

import { useAuthDialog } from "@/components/auth-dialog";
import { useSocial } from "@/components/social-provider";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { currentUser, isAuthenticated } = useSocial();
  const { openAuthDialog } = useAuthDialog();
  const profileHref = isAuthenticated && currentUser ? `/users/${currentUser.id}` : "/login";

  const items = [
    { href: "/", label: "マイ棚", icon: House, match: (path: string) => path === "/" },
    {
      href: "/feed",
      label: "フィード",
      icon: Newspaper,
      match: (path: string) => path.startsWith("/feed"),
    },
    {
      href: "/explore",
      label: "さがす",
      icon: Compass,
      match: (path: string) => path.startsWith("/explore"),
    },
    {
      href: profileHref,
      label: "マイページ",
      icon: UserRound,
      match: (path: string) =>
        isAuthenticated && currentUser
          ? path === `/users/${currentUser.id}`
          : path.startsWith("/login") || path.startsWith("/signup"),
    },
  ] as const;

  return (
    <nav
      aria-label="スマホメニュー"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-foreground/10 bg-[#f9f9fb]/92 px-2 pt-1.5 pb-[max(0.55rem,env(safe-area-inset-bottom))] shadow-[0_-16px_32px_-24px_rgb(17_17_17_/_0.35)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map((item) => {
          const active = item.match(pathname);
          const className = cn(
            "flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-semibold",
            active ? "text-foreground" : "text-muted-foreground",
          );
          const inner = (
            <>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  active && "bg-primary",
                )}
              >
                <item.icon className="size-4" />
              </span>
              {item.label}
            </>
          );

          return (
            <li key={item.label}>
              {item.label === "マイページ" && !isAuthenticated ? (
                <button
                  type="button"
                  className={className}
                  onClick={() => openAuthDialog("login")}
                >
                  {inner}
                </button>
              ) : (
                <Link href={item.href} className={className}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
