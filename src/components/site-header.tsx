"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, House, Newspaper } from "lucide-react";

import { AccountMenu } from "@/components/account-menu";
import { BrandMark } from "@/components/brand-mark";
import { PersistenceNote } from "@/components/persistence-note";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "マイ棚", icon: House },
  { href: "/feed", label: "フィード", icon: Newspaper },
  { href: "/explore", label: "さがす", icon: Compass },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-[#f9f9fb]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:h-16 sm:py-0">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <BrandMark className="size-9" />
          <span className="font-heading text-xl tracking-tight text-foreground">
            Artly
          </span>
        </Link>
        <nav
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
          aria-label="メイン"
        >
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <NavLink key={item.href} href={item.href} active={active}>
                <item.icon className="size-3.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <PersistenceNote compact />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors",
        active
          ? "bg-primary text-foreground"
          : "text-muted-foreground hover:bg-white hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
