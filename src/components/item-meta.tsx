import { type ShelfItem } from "@/lib/types";

export function ItemMeta({ item }: { item: ShelfItem }) {
  if (item.type === "music") {
    return (
      <dl className="space-y-0.5 text-xs text-muted-foreground">
        <MetaRow label="アーティスト" value={item.artist} />
        <MetaRow label="アルバム" value={item.album} />
      </dl>
    );
  }

  if (item.type === "book") {
    return (
      <dl className="space-y-0.5 text-xs text-muted-foreground">
        <MetaRow label="著者" value={item.author} />
        <MetaRow label="出版社" value={item.publisher} />
      </dl>
    );
  }

  return (
    <dl className="space-y-0.5 text-xs text-muted-foreground">
      <MetaRow label="監督" value={item.director} />
      <MetaRow label="公開年" value={item.year ? `${item.year}年` : "不明"} />
    </dl>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-foreground/45">{label}</dt>
      <dd className="truncate">{value}</dd>
    </div>
  );
}
