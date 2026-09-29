import { withReview } from "@/lib/review";
import type { ShelfItem } from "@/lib/types";

const RAW_SHELF_ITEMS: ShelfItem[] = [
  {
    id: "m-first-love",
    type: "music",
    title: "First Love",
    artist: "宇多田ヒカル",
    album: "First Love",
    rating: 5,
    comment: "雨の夜に聴くと、10代の自分がまだ部屋にいるみたいになる。",
    coverUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    year: 1999,
  },
  {
    id: "m-stray-sheep",
    type: "music",
    title: "STRAY SHEEP",
    artist: "米津玄師",
    album: "STRAY SHEEP",
    rating: 5,
    comment: "どの曲も物語みたい。夜更かしのお供に何度も回してしまう。",
    coverUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    year: 2020,
  },
  {
    id: "m-the-book",
    type: "music",
    title: "THE BOOK",
    artist: "YOASOBI",
    album: "THE BOOK",
    rating: 4,
    comment: "小説が歌になる瞬間が好き。通勤のヘッドフォンが劇場になる。",
    coverUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    year: 2021,
  },
  {
    id: "m-hehn",
    type: "music",
    title: "HELP EVER HURT NEVER",
    artist: "藤井風",
    album: "HELP EVER HURT NEVER",
    rating: 5,
    comment: "声がまっすぐすぎて、聴き終わると少し姿勢が良くなる。",
    coverUrl:
      "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=800&q=80",
    year: 2020,
  },
  {
    id: "m-shouso",
    type: "music",
    title: "勝訴ストリップ",
    artist: "椎名林檎",
    album: "勝訴ストリップ",
    rating: 5,
    comment: "言葉の刃とグルーヴ。聴くたびに新しい傷が光る。",
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    year: 2000,
  },
  {
    id: "b-norwegian",
    type: "book",
    title: "ノルウェイの森",
    author: "村上春樹",
    publisher: "講談社",
    rating: 4,
    comment: "季節の匂いごと残る本。読み返すたびに、別の人が泣いている。",
    coverUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    year: 1987,
  },
  {
    id: "b-kokoro",
    type: "book",
    title: "こころ",
    author: "夏目漱石",
    publisher: "岩波書店",
    rating: 5,
    comment: "先生の手紙に、今でも息を止めてしまう。静かな恐怖。",
    coverUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    year: 1914,
  },
  {
    id: "b-suspect-x",
    type: "book",
    title: "容疑者Xの献身",
    author: "東野圭吾",
    publisher: "文藝春秋",
    rating: 5,
    comment: "論理の美しさと、愛の残酷さが同じ頁に並んでいる。",
    coverUrl:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80",
    year: 2005,
  },
  {
    id: "b-yoru-wa-mijikashi",
    type: "book",
    title: "夜は短し歩けよ乙女",
    author: "森見登美彦",
    publisher: "角川書店",
    rating: 4,
    comment: "京都の夜が、少し酔ったまま続いてほしいと思う。",
    coverUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    year: 2006,
  },
  {
    id: "b-convenience",
    type: "book",
    title: "コンビニ人間",
    author: "村田沙耶香",
    publisher: "文藝春秋",
    rating: 4,
    comment: "普通という呪いを、蛍光灯の下で冷静に解剖している。",
    coverUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    year: 2016,
  },
  {
    id: "f-chihiro",
    type: "movie",
    title: "千と千尋の神隠し",
    director: "宮崎駿",
    rating: 5,
    comment: "名前を取り戻す話なのに、見るたびに自分の名前が少し増える。",
    coverUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    year: 2001,
  },
  {
    id: "f-kiminonawa",
    type: "movie",
    title: "君の名は。",
    director: "新海誠",
    rating: 4,
    comment: "黄昏の空を見ると、まだ誰かを探してしまう。",
    coverUrl:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80",
    year: 2016,
  },
  {
    id: "f-seven-samurai",
    type: "movie",
    title: "七人の侍",
    director: "黒澤明",
    rating: 5,
    comment: "雨と泥と誇り。映画がまだ巨大な物語だった頃の熱。",
    coverUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    year: 1954,
  },
  {
    id: "f-drive-my-car",
    type: "movie",
    title: "ドライブ・マイ・カー",
    director: "濱口竜介",
    rating: 5,
    comment: "沈黙の車内で、言葉がゆっくり戻ってくる。余韻が長い。",
    coverUrl:
      "https://images.unsplash.com/photo-1440404653325-ab127d49ea4b?auto=format&fit=crop&w=800&q=80",
    year: 2021,
  },
  {
    id: "f-tokyo-story",
    type: "movie",
    title: "東京物語",
    director: "小津安二郎",
    rating: 5,
    comment: "何も起きないようで、人生の全部が起きている。",
    coverUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    year: 1953,
  },
];

const REVIEW_EXTRAS: Record<
  string,
  Partial<Pick<ShelfItem, "tags" | "spoiler" | "experiencedAt" | "experienceMethod" | "addedAt" | "rating">>
> = {
  "m-first-love": {
    tags: ["殿堂入り"],
    experienceMethod: "vinyl",
    experiencedAt: "2024-11-03",
    addedAt: "2026-09-10T10:00:00.000Z",
  },
  "m-stray-sheep": {
    tags: ["お気に入り"],
    experienceMethod: "streaming",
    experiencedAt: "2026-08-21",
    addedAt: "2026-09-08T18:00:00.000Z",
  },
  "m-the-book": {
    tags: ["2026年"],
    rating: 4.5,
    experienceMethod: "streaming",
    experiencedAt: "2026-07-02",
    addedAt: "2026-08-30T09:00:00.000Z",
  },
  "m-hehn": {
    tags: ["お気に入り"],
    experienceMethod: "streaming",
    experiencedAt: "2026-06-18",
    addedAt: "2026-08-12T08:00:00.000Z",
  },
  "m-shouso": {
    tags: ["殿堂入り"],
    experienceMethod: "vinyl",
    experiencedAt: "2023-12-24",
    addedAt: "2026-07-01T21:00:00.000Z",
  },
  "b-norwegian": {
    tags: ["2026年"],
    rating: 4.5,
    experienceMethod: "print",
    experiencedAt: "2026-03-12",
    addedAt: "2026-09-01T12:00:00.000Z",
  },
  "b-kokoro": {
    tags: ["殿堂入り"],
    spoiler: true,
    experienceMethod: "print",
    experiencedAt: "2025-11-09",
    addedAt: "2026-06-20T22:00:00.000Z",
  },
  "b-suspect-x": {
    tags: ["2026年"],
    spoiler: true,
    experienceMethod: "ebook",
    experiencedAt: "2026-02-14",
    addedAt: "2026-05-11T19:00:00.000Z",
  },
  "b-yoru-wa-mijikashi": {
    tags: ["お気に入り"],
    experienceMethod: "print",
    experiencedAt: "2026-04-04",
    addedAt: "2026-04-28T15:00:00.000Z",
  },
  "b-convenience": {
    tags: ["あとで見る"],
    experienceMethod: "ebook",
    experiencedAt: "2026-01-19",
    addedAt: "2026-03-02T07:00:00.000Z",
  },
  "f-chihiro": {
    tags: ["殿堂入り"],
    experienceMethod: "theater",
    experiencedAt: "2024-08-16",
    addedAt: "2026-09-12T20:00:00.000Z",
  },
  "f-kiminonawa": {
    tags: ["再訪"],
    rating: 4.5,
    experienceMethod: "streaming",
    experiencedAt: "2026-08-01",
    addedAt: "2026-08-22T23:00:00.000Z",
  },
  "f-seven-samurai": {
    tags: ["お気に入り"],
    experienceMethod: "theater",
    experiencedAt: "2025-10-30",
    addedAt: "2026-02-18T21:30:00.000Z",
  },
  "f-drive-my-car": {
    tags: ["2026年"],
    experienceMethod: "theater",
    experiencedAt: "2026-05-09",
    addedAt: "2026-05-10T11:00:00.000Z",
  },
  "f-tokyo-story": {
    tags: ["殿堂入り"],
    experienceMethod: "disc",
    experiencedAt: "2023-04-02",
    addedAt: "2026-01-08T16:00:00.000Z",
  },
};

export const INITIAL_SHELF_ITEMS: ShelfItem[] = RAW_SHELF_ITEMS.map((item) =>
  withReview(item, REVIEW_EXTRAS[item.id] ?? {})
);
