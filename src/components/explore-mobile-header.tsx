"use client";

export function ExploreMobileHeader() {
  return (
    <header className="sticky top-0 z-40 bg-primary pt-[env(safe-area-inset-top)] md:hidden">
      <div className="flex h-12 items-center justify-center px-4">
        <h1 className="font-heading text-base font-bold text-foreground">さがす</h1>
      </div>
    </header>
  );
}
