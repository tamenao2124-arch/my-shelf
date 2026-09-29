"use client";

import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  accent,
  avatarUrl,
  size = "md",
}: {
  name: string;
  accent: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions =
    size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-16 text-xl" : "size-10 text-sm";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={cn(
          "inline-flex shrink-0 rounded-lg object-cover ring-1 ring-foreground/15",
          size === "sm" ? "size-8" : size === "lg" ? "size-16" : "size-10"
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg font-heading text-white ring-1 ring-foreground/15",
        dimensions
      )}
      style={{ background: accent }}
      aria-hidden="true"
    >
      {name.slice(0, 1)}
    </span>
  );
}
