import { withReview } from "@/lib/review";
import { INITIAL_SHELF_ITEMS } from "@/data/shelf-items";
import { CURRENT_USER_ID, hoursAgo, type FeedPost, type PostComment, type UserProfile } from "@/lib/social";
import type { ShelfItem } from "@/lib/types";

export const USERS: UserProfile[] = [
  {
    id: CURRENT_USER_ID,
    name: "た",
    handle: "ta",
    bio: "好きな音と物語を、静かに棚へ。",
    accent: "oklch(0.28 0.03 95)",
  },
  {
    id: "aoi",
    name: "あおい",
    handle: "aoi",
    bio: "夜更かし映画部と、途中まで読んだ文庫。",
    accent: "oklch(0.32 0.04 250)",
  },
  {
    id: "ken",
    name: "けん",
    handle: "ken.vinyl",
    bio: "レコードと散歩。J-Popの旧譜が好き。",
    accent: "oklch(0.42 0.07 130)",
  },
  {
    id: "misaki",
    name: "みさき",
    handle: "misaki",
    bio: "通勤の文庫と、週末の長編。",
    accent: "oklch(0.48 0.1 85)",
  },
  {
    id: "riku",
    name: "りく",
    handle: "riku",
    bio: "劇場の暗闇が、いちばん落ち着く。",
    accent: "oklch(0.22 0.01 90)",
  },
  {
    id: "hana",
    name: "はな",
    handle: "hana.notes",
    bio: "歌と物語を、同じ棚に置いてみたい。",
    accent: "oklch(0.55 0.12 95)",
  },
];

export const INITIAL_FOLLOWING: Record<string, string[]> = {
  ta: ["aoi", "misaki", "riku"],
  aoi: ["ta", "ken", "hana"],
  ken: ["ta", "aoi"],
  misaki: ["ta", "hana"],
  riku: ["aoi", "ken"],
  hana: ["misaki", "ta"],
};

const aoiShelf: ShelfItem[] = [
  {
    id: "aoi-drive",
    type: "movie",
    title: "ドライブ・マイ・カー",
    director: "濱口竜介",
    rating: 5,
    comment: "沈黙の車内で、言葉がゆっくり戻ってくる。",
    coverUrl:
      "https://images.unsplash.com/photo-1440404653325-ab127d49ea4b?auto=format&fit=crop&w=800&q=80",
    year: 2021,
    tags: ["2026年"],
    experienceMethod: "theater",
    experiencedAt: "2026-09-13",
    addedAt: "2026-09-14T04:00:00.000Z",
  },
  {
    id: "aoi-perfect",
    type: "movie",
    title: "パーフェクトブルー",
    director: "今敏",
    rating: 5,
    comment: "アイドルと悪夢の境目が、まだ目の裏に残っている。",
    coverUrl:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
    year: 1997,
    tags: ["お気に入り"],
    spoiler: true,
    experienceMethod: "streaming",
    experiencedAt: "2026-08-30",
    addedAt: "2026-09-11T02:00:00.000Z",
  },
  {
    id: "aoi-kokoro",
    type: "book",
    title: "こころ",
    author: "夏目漱石",
    publisher: "岩波書店",
    rating: 4,
    comment: "先生の手紙を、終電で読み切ってしまった。",
    coverUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    year: 1914,
    tags: ["殿堂入り"],
    spoiler: true,
    experienceMethod: "print",
    experiencedAt: "2026-07-18",
    addedAt: "2026-07-19T00:30:00.000Z",
  },
];

const kenShelf: ShelfItem[] = [
  {
    id: "ken-first-love",
    type: "music",
    title: "First Love",
    artist: "宇多田ヒカル",
    album: "First Love",
    rating: 5,
    comment: "雨の匂いと一緒に、1999年が再生される。",
    coverUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    year: 1999,
    tags: ["殿堂入り"],
    experienceMethod: "vinyl",
    experiencedAt: "2026-06-01",
    addedAt: "2026-09-13T16:00:00.000Z",
  },
  {
    id: "ken-hehn",
    type: "music",
    title: "HELP EVER HURT NEVER",
    artist: "藤井風",
    album: "HELP EVER HURT NEVER",
    rating: 5,
    comment: "朝のキッチンで流すと、一日の音程が決まる。",
    coverUrl:
      "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=800&q=80",
    year: 2020,
  },
  {
    id: "ken-shouso",
    type: "music",
    title: "勝訴ストリップ",
    artist: "椎名林檎",
    album: "勝訴ストリップ",
    rating: 5,
    comment: "言葉の刃を、レコードの溝で受け止める。",
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    year: 2000,
  },
];

const misakiShelf: ShelfItem[] = [
  {
    id: "misaki-norwegian",
    type: "book",
    title: "ノルウェイの森",
    author: "村上春樹",
    publisher: "講談社",
    rating: 5,
    comment: "季節の匂いごと残る本。",
    coverUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    year: 1987,
    tags: ["2026年"],
    experienceMethod: "print",
    experiencedAt: "2026-09-04",
    addedAt: "2026-09-14T01:00:00.000Z",
  },
  {
    id: "misaki-convenience",
    type: "book",
    title: "コンビニ人間",
    author: "村田沙耶香",
    publisher: "文藝春秋",
    rating: 4,
    comment: "普通という呪いを、蛍光灯の下で解剖している。",
    coverUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    year: 2016,
    spoiler: true,
    tags: ["あとで見る"],
    experienceMethod: "ebook",
    experiencedAt: "2026-08-08",
    addedAt: "2026-08-09T06:00:00.000Z",
  },
  {
    id: "misaki-suspect",
    type: "book",
    title: "容疑者Xの献身",
    author: "東野圭吾",
    publisher: "文藝春秋",
    rating: 5,
    comment: "論理の美しさと、愛の残酷さ。",
    coverUrl:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80",
    year: 2005,
  },
];

const rikuShelf: ShelfItem[] = [
  {
    id: "riku-seven",
    type: "movie",
    title: "七人の侍",
    director: "黒澤明",
    rating: 5,
    comment: "雨と泥と誇り。",
    coverUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    year: 1954,
  },
  {
    id: "riku-chihiro",
    type: "movie",
    title: "千と千尋の神隠し",
    director: "宮崎駿",
    rating: 5,
    comment: "名前を取り戻す話なのに、見るたびに名前が少し増える。",
    coverUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    year: 2001,
    tags: ["殿堂入り"],
    experienceMethod: "theater",
    experiencedAt: "2026-09-10",
    addedAt: "2026-09-13T21:00:00.000Z",
  },
  {
    id: "riku-tokyo",
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

const hanaShelf: ShelfItem[] = [
  {
    id: "hana-yoasobi",
    type: "music",
    title: "THE BOOK",
    artist: "YOASOBI",
    album: "THE BOOK",
    rating: 4,
    comment: "小説が歌になる瞬間が好き。",
    coverUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    year: 2021,
  },
  {
    id: "hana-yoru",
    type: "book",
    title: "夜は短し歩けよ乙女",
    author: "森見登美彦",
    publisher: "角川書店",
    rating: 5,
    comment: "京都の夜が、少し酔ったまま続いてほしい。",
    coverUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    year: 2006,
  },
  {
    id: "hana-kimi",
    type: "movie",
    title: "君の名は。",
    director: "新海誠",
    rating: 4.5,
    comment: "黄昏の空を見ると、まだ誰かを探してしまう。",
    coverUrl:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80",
    year: 2016,
    tags: ["再訪"],
    experienceMethod: "streaming",
    experiencedAt: "2026-08-22",
    addedAt: "2026-09-12T22:00:00.000Z",
  },
];

export const INITIAL_SHELVES: Record<string, ShelfItem[]> = {
  ta: INITIAL_SHELF_ITEMS,
  aoi: aoiShelf.map((item) => withReview(item, {})),
  ken: kenShelf.map((item) => withReview(item, {})),
  misaki: misakiShelf.map((item) => withReview(item, {})),
  riku: rikuShelf.map((item) => withReview(item, {})),
  hana: hanaShelf.map((item) => withReview(item, {})),
};

export const INITIAL_POSTS: FeedPost[] = [
  {
    id: "p-aoi-1",
    userId: "aoi",
    item: aoiShelf[0],
    createdAt: hoursAgo(2),
  },
  {
    id: "p-misaki-1",
    userId: "misaki",
    item: misakiShelf[0],
    createdAt: hoursAgo(5),
  },
  {
    id: "p-riku-1",
    userId: "riku",
    item: rikuShelf[1],
    createdAt: hoursAgo(9),
  },
  {
    id: "p-ken-1",
    userId: "ken",
    item: kenShelf[0],
    createdAt: hoursAgo(14),
  },
  {
    id: "p-aoi-2",
    userId: "aoi",
    item: aoiShelf[1],
    createdAt: hoursAgo(20),
  },
  {
    id: "p-hana-1",
    userId: "hana",
    item: hanaShelf[2],
    createdAt: hoursAgo(28),
  },
  {
    id: "p-misaki-2",
    userId: "misaki",
    item: misakiShelf[1],
    createdAt: hoursAgo(36),
  },
  {
    id: "p-riku-2",
    userId: "riku",
    item: rikuShelf[0],
    createdAt: hoursAgo(48),
  },
];

export const INITIAL_LIKES: Record<string, string[]> = {
  "p-aoi-1": ["ta", "ken", "hana"],
  "p-misaki-1": ["ta", "hana"],
  "p-riku-1": ["aoi", "ta"],
  "p-ken-1": ["aoi"],
  "p-aoi-2": ["riku"],
  "p-hana-1": ["misaki", "ta"],
  "p-misaki-2": ["hana"],
  "p-riku-2": ["ken", "aoi"],
};

export const INITIAL_COMMENTS: Record<string, PostComment[]> = {
  "p-aoi-1": [
    {
      id: "c-1",
      userId: "ta",
      text: "この余韻、わかる。車内の沈黙が好き。",
      createdAt: hoursAgo(1.2),
    },
  ],
  "p-misaki-1": [
    {
      id: "c-2",
      userId: "hana",
      text: "秋になると、また読みたくなる。",
      createdAt: hoursAgo(3),
    },
  ],
  "p-riku-1": [
    {
      id: "c-3",
      userId: "aoi",
      text: "油屋の湯気を思い出した。",
      createdAt: hoursAgo(8),
    },
  ],
};
