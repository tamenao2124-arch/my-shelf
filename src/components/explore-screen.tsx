"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { AddItemDialog } from "@/components/add-item-dialog";
import { ExploreHitCard } from "@/components/explore-hit-card";
import { ImeTextInput } from "@/components/ime-text-input";
import { UserListRow } from "@/components/profile-header";
import { useSocial } from "@/components/social-provider";
import {
  filterHitsByTab,
  localCatalogHits,
  partitionExploreSections,
  type ExploreTab,
} from "@/lib/explore/browse-pool";
import {
  identityKey,
  searchableText,
  type MediaType,
  type SearchHit,
  type ShelfItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: { value: ExploreTab; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "music", label: "音楽" },
  { value: "book", label: "本" },
  { value: "movie", label: "映画" },
];

const SEARCH_TYPES: MediaType[] = ["music", "book", "movie"];

function dedupeHits(hits: SearchHit[]) {
  const seen = new Set<string>();
  const out: SearchHit[] = [];
  for (const hit of hits) {
    const key = hit.id || identityKey(hit);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hit);
  }
  return out;
}

function shelfItemToHit(item: ShelfItem): SearchHit {
  return {
    id: `shelf-${item.id}`,
    type: item.type,
    title: item.title,
    coverUrl: item.coverUrl,
    year: item.year,
    source: "local",
    sourceLabel: "みんなの棚",
    artist: item.type === "music" ? item.artist : undefined,
    album: item.type === "music" ? item.album : undefined,
    author: item.type === "book" ? item.author : undefined,
    publisher: item.type === "book" ? item.publisher : undefined,
    director: item.type === "movie" ? item.director : undefined,
  };
}

export function ExploreScreen() {
  const {
    users,
    shelves,
    followingIds,
    followerIds,
    currentUser,
    isAuthenticated,
    addToMyShelf,
  } = useSocial();

  const [tab, setTab] = useState<ExploreTab>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [browseHits, setBrowseHits] = useState<SearchHit[]>([]);
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [browseLoading, setBrowseLoading] = useState(true);

  const myItems = currentUser ? (shelves[currentUser.id] ?? []) : [];

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 320);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    return () => {
      const active = document.activeElement;
      if (active instanceof HTMLElement) active.blur();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadBrowse() {
      setBrowseLoading(true);
      const pool = dedupeHits([
        ...localCatalogHits(),
        ...(await fetchCatalog("movie", "", "theaters")),
        ...(await fetchCatalog("music", "サウンドトラック")),
        ...(await fetchCatalog("book", "ベストセラー")),
      ]);
      if (!cancelled) {
        setBrowseHits(pool);
        setBrowseLoading(false);
      }
    }
    void loadBrowse();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function runSearch() {
      if (!debouncedQuery) {
        setSearchHits([]);
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      const types = tab === "all" ? SEARCH_TYPES : [tab];
      const batches = await Promise.all(
        types.map((type) => fetchCatalog(type, debouncedQuery)),
      );
      const fromShelves = collectShelfHits(
        debouncedQuery,
        shelves,
        tab === "all" ? undefined : tab,
      );
      if (!cancelled) {
        setSearchHits(dedupeHits([...batches.flat(), ...fromShelves]));
        setSearchLoading(false);
      }
    }
    void runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, tab, shelves]);

  const filteredUsers = useMemo(() => {
    const normalized = debouncedQuery.toLowerCase();
    return users.filter((user) => {
      if (!normalized) return true;
      return [user.name, user.handle, user.bio]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [debouncedQuery, users]);

  const displayHits = useMemo(() => {
    const base = debouncedQuery ? searchHits : browseHits;
    return filterHitsByTab(base, tab);
  }, [browseHits, debouncedQuery, searchHits, tab]);

  const sections = useMemo(
    () => partitionExploreSections(displayHits),
    [displayHits],
  );

  const handleAdd = useCallback(
    (item: ShelfItem) => {
      if (!isAuthenticated) return;
      return addToMyShelf(item);
    },
    [addToMyShelf, isAuthenticated],
  );

  const showSections = !debouncedQuery;
  const showUserSection =
    debouncedQuery.length > 0 ? filteredUsers.length > 0 : users.length > 0;

  return (
    <div className="bg-[#fffdf5] md:bg-transparent">
      <div className="bg-[#fffdf5] px-4 pt-3 pb-3 md:px-0 md:pt-0">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <ImeTextInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="タイトル、人、感想で検索"
            className="h-11 rounded-lg border-2 border-foreground/10 bg-white pl-9 text-base shadow-none md:text-sm"
            inputMode="search"
            enterKeyHint="search"
            aria-label="作品・ユーザーを検索"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {TABS.map((entry) => {
            const active = tab === entry.value;
            return (
              <button
                key={entry.value}
                type="button"
                onClick={() => setTab(entry.value)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-primary bg-primary text-foreground"
                    : "border-foreground/15 bg-white text-foreground",
                )}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-28 md:px-0 md:pb-16">
        {searchLoading || browseLoading ? (
          <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            読み込んでいます…
          </p>
        ) : null}

        {!searchLoading && !browseLoading && debouncedQuery && displayHits.length === 0 ? (
          <p className="rounded-lg border border-dashed border-foreground/15 bg-white px-4 py-10 text-center text-sm text-muted-foreground">
            「{debouncedQuery}」に一致する作品は見つかりませんでした。
          </p>
        ) : null}

        {showSections ? (
          <div className="space-y-8">
            <ExploreSection title="トレンド" hits={sections.trend} items={myItems} onAdd={handleAdd} />
            <ExploreSection title="新着" hits={sections.newArrival} items={myItems} onAdd={handleAdd} />
            <ExploreSection
              title="おすすめ"
              hits={sections.recommended}
              items={myItems}
              onAdd={handleAdd}
            />
          </div>
        ) : (
          <ExploreSection
            title={`「${debouncedQuery}」の結果`}
            hits={displayHits}
            items={myItems}
            onAdd={handleAdd}
          />
        )}

        {showUserSection ? (
          <section className="mt-10">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              {debouncedQuery ? "ユーザー" : "みんなを探す"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              フォローすると、その人の棚がフィードに届きます。
            </p>
            <ul className="mt-3 grid gap-2">
              {(debouncedQuery ? filteredUsers : users).map((user) => (
                <li key={user.id}>
                  <div className="grid gap-1">
                    <UserListRow user={user} />
                    <p className="px-3 pb-2 text-xs text-muted-foreground">
                      作品 {(shelves[user.id] ?? []).length} · フォロー{" "}
                      {followingIds(user.id).length} · フォロワー{" "}
                      {followerIds(user.id).length}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : debouncedQuery ? (
          <p className="mt-8 rounded-lg border border-dashed border-foreground/15 bg-white px-4 py-8 text-center text-sm text-muted-foreground">
            「{debouncedQuery}」に一致するユーザーはいません。
          </p>
        ) : null}

        {isAuthenticated ? (
          <div className="mt-8 flex justify-end">
            <AddItemDialog onAdd={addToMyShelf} existingItems={myItems} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ExploreSection({
  title,
  hits,
  items,
  onAdd,
}: {
  title: string;
  hits: readonly SearchHit[];
  items: ShelfItem[];
  onAdd?: (item: ShelfItem) => void | Promise<void>;
}) {
  if (hits.length === 0) return null;

  return (
    <section aria-labelledby={title}>
      <h2 id={title} className="font-heading text-xl font-bold tracking-tight">
        {title}
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {hits.map((hit) => (
          <li key={hit.id}>
            <ExploreHitCard hit={hit} existingItems={items} onAdd={onAdd} />
          </li>
        ))}
      </ul>
    </section>
  );
}

async function fetchCatalog(
  type: MediaType,
  q: string,
  service?: string,
): Promise<SearchHit[]> {
  try {
    const params = new URLSearchParams({ type });
    if (q) params.set("q", q);
    if (service) params.set("service", service);
    const response = await fetch(`/api/search?${params}`);
    if (!response.ok) return [];
    const data = (await response.json()) as { results?: SearchHit[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}

function collectShelfHits(
  query: string,
  shelves: Record<string, ShelfItem[]>,
  type?: MediaType,
) {
  const normalized = query.toLowerCase();
  const hits: SearchHit[] = [];
  for (const items of Object.values(shelves)) {
    for (const item of items) {
      if (type && item.type !== type) continue;
      if (!searchableText(item).toLowerCase().includes(normalized)) continue;
      hits.push(shelfItemToHit(item));
    }
  }
  return hits;
}
