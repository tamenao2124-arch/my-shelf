"use client";

import { ExploreMobileHeader } from "@/components/explore-mobile-header";
import { ExploreScreen } from "@/components/explore-screen";

export default function ExplorePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-x-hidden bg-[#fffdf5] md:bg-transparent md:px-4 md:pt-8">
      <ExploreMobileHeader />
      <div className="hidden md:block">
        <h1 className="font-heading text-4xl tracking-tight">さがす</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          作品を探してその場で棚に追加できます。ユーザーをフォローする機能もこれまで通り使えます。
        </p>
      </div>
      <div className="min-h-0 flex-1 pb-2 md:mt-6">
        <ExploreScreen />
      </div>
    </main>
  );
}
