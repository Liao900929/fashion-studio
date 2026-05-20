import { NextResponse } from "next/server";
import Parser from "rss-parser";

// 每 6 小時重新抓取一次（ISR 快取，降低重複請求）
export const revalidate = 21600;

const FEEDS: { url: string; source: string }[] = [
  { url: "https://www.vogue.com/feed/rss", source: "Vogue" },
  { url: "https://www.harpersbazaar.com/rss/all.xml/", source: "Harper's BAZAAR" },
  { url: "https://www.elle.com/rss/all.xml/", source: "ELLE" },
  { url: "https://hypebeast.com/feed", source: "Hypebeast" },
];

type NewsItem = {
  title: string;
  link: string;
  source: string;
  date: string | null;
};

export async function GET() {
  const parser = new Parser({ timeout: 8000 });

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).slice(0, 6).map((item) => ({
        title: item.title ?? "",
        link: item.link ?? "",
        source: feed.source,
        date: item.isoDate ?? item.pubDate ?? null,
      }));
    })
  );

  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  // 依日期新到舊排序
  all.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });

  return NextResponse.json({ items: all.slice(0, 8) });
}
