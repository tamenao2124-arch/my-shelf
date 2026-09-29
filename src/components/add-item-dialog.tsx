"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Plus, Search } from "lucide-react";

import { SparkleBurst } from "@/components/sparkle-burst";

import { CatalogServicePicker } from "@/components/catalog-service-picker";
import { MediaTypePicker } from "@/components/media-type-picker";
import { ReviewFields } from "@/components/review-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImeTextInput } from "@/components/ime-text-input";
import { Label } from "@/components/ui/label";
import {
  catalogService,
  experienceMethodFromHit,
  type CatalogServiceId,
} from "@/lib/catalog/services";
import { EMPTY_REVIEW_DRAFT, type ReviewDraft } from "@/lib/review";
import {
  MEDIA_EMOJI,
  MEDIA_LABEL,
  identityKey,
  mediaCreator,
  searchHitToShelfItem,
  type MediaType,
  type SearchHit,
  type ShelfItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type AddItemDialogProps = {
  onAdd: (item: ShelfItem) => void | Promise<void>;
  existingItems: ShelfItem[];
};

const SEARCH_PLACEHOLDER: Record<MediaType, string> = {
  music: "例: 宇多田ヒカル、First Love",
  book: "例: 村上春樹、ノルウェイの森、Kindle",
  movie: "例: 邦画、洋画、千と千尋、ショーシャンク",
};

export function AddItemDialog({ onAdd, existingItems }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>("music");
  const [service, setService] = useState<CatalogServiceId | undefined>();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [selected, setSelected] = useState<SearchHit | null>(null);
  const [review, setReview] = useState<ReviewDraft>(EMPTY_REVIEW_DRAFT);
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "ready">(
    "idle"
  );
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [manual, setManual] = useState(false);
  const [burst, setBurst] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualCreator, setManualCreator] = useState("");
  const [manualSecondary, setManualSecondary] = useState("");

  const existingKeys = useMemo(
    () => new Set(existingItems.map((item) => identityKey(item))),
    [existingItems]
  );

  function reset() {
    setMediaType("music");
    setService(undefined);
    setKeyword("");
    setResults([]);
    setSelected(null);
    setReview(EMPTY_REVIEW_DRAFT);
    setStatus("idle");
    setError("");
    setWarnings([]);
    setManual(false);
    setManualTitle("");
    setManualCreator("");
    setManualSecondary("");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleTypeChange(next: MediaType) {
    setMediaType(next);
    setService(undefined);
    setResults([]);
    setSelected(null);
    setStatus("idle");
    setError("");
    setWarnings([]);
    setManualSecondary("");
  }

  function handleServiceChange(next?: CatalogServiceId) {
    setService(next);
    setResults([]);
    setSelected(null);
    setStatus("idle");
    setError("");
    setWarnings([]);
  }

  async function runSearch(nextService = service) {
    const q = keyword.trim();
    if (!q && !nextService) {
      setError("キーワードを入力するか、Netflix / Kindle などの場所を選んでください。");
      return;
    }

    setError("");
    setWarnings([]);
    setSelected(null);
    setStatus("loading");

    try {
      const params = new URLSearchParams({ type: mediaType });
      if (q) params.set("q", q);
      if (nextService) params.set("service", nextService);
      const response = await fetch(`/api/search?${params}`);
      const data = (await response.json()) as {
        results?: SearchHit[];
        error?: string;
        warnings?: string[];
      };
      if (!response.ok) {
        throw new Error(data.error || "検索に失敗しました。");
      }
      const hits = (data.results ?? []).filter((hit) => hit.type === mediaType);
      setResults(hits);
      setWarnings(data.warnings ?? []);
      setStatus(hits.length ? "ready" : "empty");
    } catch (err) {
      setResults([]);
      setWarnings([]);
      setStatus("idle");
      setError(
        err instanceof Error
          ? err.message
          : "検索に失敗しました。時間をおいて再度お試しください。"
      );
    }
  }

  function isOnShelf(hit: SearchHit) {
    return existingKeys.has(identityKey(hit));
  }

  function addHit(hit: SearchHit) {
    if (hit.type !== mediaType) {
      setError("選択中のメディアタイプと結果が一致しません。");
      return;
    }
    if (isOnShelf(hit)) {
      setError("この作品はすでに棚にあります。");
      return;
    }
    onAdd(
      searchHitToShelfItem(hit, {
        rating: review.rating,
        comment: review.comment.trim() || "まだ感想は書いていません。",
        tags: review.tags,
        spoiler: review.spoiler,
        experiencedAt: review.experiencedAt || undefined,
        experienceMethod:
          review.experienceMethod ||
          experienceMethodFromHit(hit) ||
          catalogService(service)?.experienceMethod ||
          undefined,
      })
    );
    celebrateAndClose();
  }

  function celebrateAndClose() {
    setBurst(true);
    window.setTimeout(() => {
      setBurst(false);
      handleOpenChange(false);
    }, 420);
  }

  function handleAddSelected() {
    if (!selected) {
      setError("検索結果から作品を選んでください。");
      return;
    }
    addHit(selected);
  }

  function handleManualAdd(event: FormEvent) {
    event.preventDefault();
    if (!manualTitle.trim() || !manualCreator.trim()) {
      setError("タイトルと名前は必須です。");
      return;
    }

    const year = Number.parseInt(manualSecondary, 10);
    const extras = {
      rating: review.rating,
      comment: review.comment.trim() || "まだ感想は書いていません。",
      tags: review.tags,
      spoiler: review.spoiler,
      experiencedAt: review.experiencedAt || undefined,
      experienceMethod: review.experienceMethod || undefined,
      addedAt: new Date().toISOString(),
    };

    if (mediaType === "music") {
      onAdd({
        id: `custom-${Date.now()}`,
        type: "music",
        title: manualTitle.trim(),
        artist: manualCreator.trim(),
        album: manualSecondary.trim() || manualTitle.trim(),
        coverUrl: "",
        ...extras,
      });
    } else if (mediaType === "book") {
      onAdd({
        id: `custom-${Date.now()}`,
        type: "book",
        title: manualTitle.trim(),
        author: manualCreator.trim(),
        publisher: manualSecondary.trim() || "出版社不明",
        coverUrl: "",
        ...extras,
      });
    } else {
      onAdd({
        id: `custom-${Date.now()}`,
        type: "movie",
        title: manualTitle.trim(),
        director: manualCreator.trim(),
        coverUrl: "",
        year: Number.isFinite(year) ? year : undefined,
        ...extras,
      });
    }
    celebrateAndClose();
  }

  const creatorPlaceholder =
    mediaType === "music"
      ? "アーティスト名"
      : mediaType === "book"
        ? "著者名"
        : "監督名";
  const secondaryPlaceholder =
    mediaType === "music"
      ? "アルバム名"
      : mediaType === "book"
        ? "出版社"
        : "公開年（例: 2001）";

  return (
    <div className="relative">
      <SparkleBurst active={burst} />
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="relative gap-1.5 px-4 font-semibold">
            <Plus className="size-4" />
            作品を追加
          </Button>
        }
      />
      <DialogContent className="flex max-h-[min(90dvh,760px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-foreground/10 p-4 pr-12">
          <DialogTitle className="font-heading text-xl">棚に並べる</DialogTitle>
          <DialogDescription>
            本・映画・音楽を選び、Netflix や Kindle などの場所から検索してマイ棚に追加します。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 overflow-y-auto p-4">
          <MediaTypePicker value={mediaType} onChange={handleTypeChange} />
          <CatalogServicePicker
            mediaType={mediaType}
            value={service}
            onChange={(next) => {
              handleServiceChange(next);
              if (next || keyword.trim()) {
                void runSearch(next);
              }
            }}
          />

          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
            }}
            className="flex gap-2"
          >
            <Label htmlFor="work-search" className="sr-only">
              {MEDIA_LABEL[mediaType]}を検索
            </Label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <ImeTextInput
                id="work-search"
                type="search"
                enterKeyHint="search"
                value={keyword}
                onChange={(event) => setKeyword(event.currentTarget.value)}
                onConfirmEnter={() => {
                  void runSearch();
                }}
                placeholder={
                  service === "netflix"
                    ? "空欄で Netflix の話題作、またはタイトル"
                    : service === "prime"
                      ? "空欄で Prime Video の話題作、またはタイトル"
                      : service === "unext"
                        ? "空欄で U-NEXT の話題作、またはタイトル"
                        : service === "kindle"
                          ? "空欄で電子書籍の話題作、またはタイトル / 著者"
                          : SEARCH_PLACEHOLDER[mediaType]
                }
                className="h-9 pl-8"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <Button
              type="button"
              disabled={status === "loading"}
              onClick={() => {
                void runSearch();
              }}
            >
              {status === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "検索"
              )}
            </Button>
          </form>

          {status === "idle" && !error ? (
            <p className="rounded-xl bg-muted/50 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
              いまは「{MEDIA_EMOJI[mediaType]} {MEDIA_LABEL[mediaType]}」
              {service ? ` / ${catalogService(service)?.label}` : ""}
              を検索します。
              {mediaType === "music"
                ? " iTunes Search API（.env.local に Spotify キーがあれば Spotify）からアルバムとジャケットを取得します。"
                : mediaType === "book"
                  ? service === "kindle"
                    ? " Apple Books、Open Library、内蔵カタログから電子書籍を探します。"
                    : " Apple Books、Open Library、Wikipedia、内蔵カタログから書誌を探します。Kindle を選ぶと電子書籍を優先します。"
                  : " 内蔵カタログ、AniList、Wikipedia で映画・アニメ・ドラマを探します。TMDB キーがあると Netflix / Prime / U-NEXT の配信情報が付きます。"}
            </p>
          ) : null}

          {status === "loading" ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {MEDIA_LABEL[mediaType]}を検索しています…
            </div>
          ) : null}

          {warnings.length ? (
            <ul className="grid gap-1.5 rounded-xl border border-foreground/10 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}

          {status === "empty" ? (
            <p className="rounded-lg border border-dashed border-foreground/20 px-3 py-8 text-center text-sm text-muted-foreground">
              {keyword.trim()
                ? `「${keyword}」の${MEDIA_LABEL[mediaType]}は見つかりませんでした。`
                : `${catalogService(service)?.label ?? "指定の場所"}の${MEDIA_LABEL[mediaType]}は見つかりませんでした。`}
              メディアタイプや探す場所を変えてみてください。
            </p>
          ) : null}

          {status === "ready" ? (
            <ul className="grid max-h-[min(52dvh,480px)] gap-1.5 overflow-y-auto pr-1">
              {results.map((hit) => {
                const active = selected?.id === hit.id;
                const already = isOnShelf(hit);
                return (
                  <li key={hit.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(hit);
                        setError("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition",
                        active
                          ? "bg-primary/40 ring-1 ring-foreground/20"
                          : "bg-white hover:bg-muted"
                      )}
                    >
                      <ResultCover hit={hit} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate font-medium">
                            {hit.title}
                          </span>
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {MEDIA_EMOJI[hit.type]} {MEDIA_LABEL[hit.type]}
                          </Badge>
                        </span>
                        {hit.providers?.length ? (
                          <span className="mt-0.5 flex flex-wrap gap-1">
                            {hit.providers.map((provider) => (
                              <Badge
                                key={provider}
                                variant="secondary"
                                className="text-[10px] normal-case tracking-normal"
                              >
                                {provider}
                              </Badge>
                            ))}
                          </span>
                        ) : null}
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {resultMeta(hit)}
                          {already ? " · 追加済み" : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {selected || manual ? (
            <div className="grid gap-3 rounded-lg border border-foreground/10 bg-muted/40 p-3">
              {selected ? (
                <p className="text-sm">
                  選択中:{" "}
                  <span className="font-medium">
                    {selected.title} / {mediaCreator(selected)}
                  </span>
                </p>
              ) : null}
              <ReviewFields mediaType={mediaType} value={review} onChange={setReview} />
            </div>
          ) : null}

          <button
            type="button"
            className="text-left text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            onClick={() => setManual((value) => !value)}
          >
            {manual ? "検索に戻る" : "見つからないときは手動で追加"}
          </button>

          {manual ? (
            <form id="manual-add" onSubmit={handleManualAdd} className="grid gap-3">
              <ImeTextInput
                value={manualTitle}
                onChange={(event) => setManualTitle(event.currentTarget.value)}
                placeholder="タイトル"
                autoComplete="off"
              />
              <ImeTextInput
                value={manualCreator}
                onChange={(event) => setManualCreator(event.currentTarget.value)}
                placeholder={creatorPlaceholder}
                autoComplete="off"
              />
              <ImeTextInput
                value={manualSecondary}
                onChange={(event) =>
                  setManualSecondary(event.currentTarget.value)
                }
                placeholder={secondaryPlaceholder}
                inputMode={mediaType === "movie" ? "numeric" : "text"}
                autoComplete="off"
              />
            </form>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-none sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            キャンセル
          </Button>
          {manual ? (
            <Button type="submit" form="manual-add">
              棚に追加
            </Button>
          ) : (
            <Button type="button" onClick={handleAddSelected} disabled={!selected}>
              棚に追加
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}

function resultMeta(hit: SearchHit) {
  const people =
    hit.type === "music"
      ? [hit.artist, hit.album]
      : hit.type === "book"
        ? [hit.author, hit.publisher]
        : [hit.director, hit.year ? `${hit.year}年` : ""];
  return [...people, hit.sourceLabel].filter(Boolean).join(" · ");
}

function ResultCover({ hit }: { hit: SearchHit }) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(hit.coverUrl) && !broken;

  return (
    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#111111]">
      {showImage ? (
        // External catalog covers come from many CDNs.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hit.coverUrl}
          alt=""
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-base">
          {MEDIA_EMOJI[hit.type]}
        </span>
      )}
    </span>
  );
}
