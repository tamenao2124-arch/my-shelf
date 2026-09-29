import type { MediaType } from "@/lib/types";
import { MOVIE_CATALOG } from "@/data/movie-catalog";

export type LocalWork = {
  type: MediaType;
  title: string;
  aliases?: string[];
  director?: string;
  author?: string;
  artist?: string;
  album?: string;
  publisher?: string;
  year?: number;
  providers?: string[];
  wikiEn?: string;
  origin?: "jp" | "west";
};

function book(
  title: string,
  author: string,
  extras: { publisher?: string; year?: number; aliases?: string[]; providers?: string[] } = {}
): LocalWork {
  return { type: "book", title, author, ...extras };
}

const BOOKS: LocalWork[] = [
  book("ノルウェイの森", "村上春樹", {
    publisher: "講談社",
    year: 1987,
    aliases: ["Norwegian Wood"],
    providers: ["Kindle"],
  }),
  book("1Q84", "村上春樹", { publisher: "新潮社", year: 2009, providers: ["Kindle"] }),
  book("海辺のカフカ", "村上春樹", { publisher: "新潮社", year: 2002 }),
  book("騎士団長殺し", "村上春樹", { publisher: "新潮社", year: 2017 }),
  book("羊をめぐる冒険", "村上春樹", { publisher: "講談社", year: 1982 }),
  book("世界の終りとハードボイルド・ワンダーランド", "村上春樹", {
    publisher: "新潮社",
    year: 1985,
    aliases: ["世界の終わりとハードボイルド・ワンダーランド"],
  }),
  book("コンビニ人間", "村田沙耶香", {
    publisher: "文藝春秋",
    year: 2016,
    providers: ["Kindle"],
  }),
  book("火花", "又吉直樹", { publisher: "文藝春秋", year: 2015, providers: ["Kindle"] }),
  book("夜は短し歩けよ乙女", "森見登美彦", {
    publisher: "角川書店",
    year: 2006,
    providers: ["Kindle"],
  }),
  book("四畳半神話大系", "森見登美彦", { publisher: "角川書店", year: 2004 }),
  book("嫌われる勇気", "岸見一郎", {
    publisher: "ダイヤモンド社",
    year: 2013,
    aliases: ["アドラー"],
    providers: ["Kindle"],
  }),
  book("人を動かす", "D・カーネギー", { publisher: "創元社", year: 1936 }),
  book("7つの習慣", "スティーブン・R・コヴィー", { aliases: ["七つの習慣"] }),
  book("かがみの孤城", "辻村深月", { publisher: "ポプラ社", year: 2017 }),
  book("君の膵臓をたべたい", "住野よる", { publisher: "双葉社", year: 2015 }),
  book("三体", "劉慈欣", { publisher: "早川書房", year: 2008, providers: ["Kindle"] }),
  book("こころ", "夏目漱石", { publisher: "岩波文庫", year: 1914 }),
  book("人間失格", "太宰治", { publisher: "新潮文庫", year: 1948 }),
  book("羅生門", "芥川龍之介", { year: 1915 }),
  book("走れメロス", "太宰治", { year: 1940 }),
  book("銀河鉄道の夜", "宮沢賢治", { year: 1934 }),
  book("窓ぎわのトットちゃん", "黒柳徹子", { publisher: "講談社", year: 1981 }),
  book("蜜蜂と遠雷", "恩田陸", { publisher: "幻冬舎", year: 2016 }),
  book("羊と鋼の森", "宮下奈都", { publisher: "文藝春秋", year: 2015 }),
  book("流浪の月", "凪良ゆう", { publisher: "東京創元社", year: 2019 }),
  book("推し、燃ゆ", "宇佐見りん", { publisher: "河出書房新社", year: 2020 }),
  book("ある男", "平野啓一郎", { publisher: "文藝春秋", year: 2018 }),
  book("告白", "湊かなえ", { publisher: "双葉社", year: 2008 }),
  book("白夜行", "東野圭吾", { publisher: "集英社", year: 1999 }),
  book("容疑者Xの献身", "東野圭吾", { publisher: "文藝春秋", year: 2005 }),
  book("秘密", "東野圭吾", { publisher: "文藝春秋", year: 1998 }),
  book("マスカレード・ホテル", "東野圭吾", { publisher: "集英社", year: 2011 }),
  book("ハリー・ポッターと賢者の石", "J.K.ローリング", {
    aliases: ["ハリーポッター", "賢者の石"],
    year: 1997,
    providers: ["Kindle"],
  }),
  book("サピエンス全史", "ユヴァル・ノア・ハラリ", { year: 2011 }),
  book("ファクトフルネス", "ハンス・ロスリング", { year: 2018 }),
  book("星の王子さま", "サン＝テグジュペリ", { aliases: ["星の王子様"] }),
  book("1984", "ジョージ・オーウェル", { aliases: ["一九八四年"] }),
  book("金持ち父さん 貧乏父さん", "ロバート・キヨサキ", {
    aliases: ["金持ち父さん"],
  }),
  book("君の名は", "新海誠", { publisher: "角川文庫", year: 2016 }),
  book("ビブリア古書堂の事件手帖", "三上延", { publisher: "メディアワークス", year: 2011 }),
  book("また、同じ夢を見ていた", "住野よる", { publisher: "双葉社", year: 2016 }),
];

export const LOCAL_CATALOG: LocalWork[] = [...MOVIE_CATALOG, ...BOOKS];
