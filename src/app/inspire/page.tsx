"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
import type { ClothingItem } from "@/types";
import { RefreshCw, Loader2, ArrowUpRight, ChevronDown } from "lucide-react";
import { SS_2026_TRENDS, type Trend } from "@/lib/trends/ss-2026";

const OWNER_EMAIL = "zj454vu06@gmail.com";

type NewsItem = { title: string; link: string; source: string; date: string | null };

export default function InspirePage() {
  const supabase = createSupabaseBrowser();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiDisabledMsg, setAiDisabledMsg] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [openTrend, setOpenTrend] = useState<string | null>(null);

  useEffect(() => {
    load();
    loadNews();
  }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    setIsOwner(user?.email === OWNER_EMAIL);
    const { data: iData } = await supabase.from("clothing_items").select("*").limit(20);
    setItems((iData as ClothingItem[]) ?? []);
    setLoading(false);
  }

  async function loadNews() {
    try {
      const res = await fetch("/api/fashion-news");
      const data = await res.json();
      setNews(data.items ?? []);
    } catch {
      setNews([]);
    }
  }

  async function refresh() {
    setRefreshing(true);
    setAiDisabledMsg("");
    try {
      const res = await fetch("/api/trends/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.disabled) setAiDisabledMsg(data.message ?? "AI 即時更新需要 Anthropic 金鑰");
    } finally {
      setRefreshing(false);
    }
  }

  function fmtDate(d: string | null) {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
    } catch {
      return "";
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />

      <main className="flex-1 px-6 md:px-10 py-10 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-end justify-between mb-3 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-2">SEASONAL INSPIRATION</p>
            <h1 className="serif text-4xl md:text-5xl">{SS_2026_TRENDS.season} 趨勢策展</h1>
            <p className="text-xs mt-2" style={{ color: "var(--fg-muted)" }}>
              {SS_2026_TRENDS.source}
            </p>
          </div>
          {isOwner && (
            <div className="flex flex-col items-end gap-2">
              <button onClick={refresh} disabled={refreshing} className="btn-ghost flex items-center gap-2">
                {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {refreshing ? "AI 更新中" : "AI 進階版即時更新"}
              </button>
              {aiDisabledMsg && (
                <p className="text-xs" style={{ color: "var(--accent)" }}>{aiDisabledMsg}</p>
              )}
            </div>
          )}
        </div>

        {/* 本週時尚快訊 RSS */}
        {news.length > 0 && (
          <section className="mb-14 mt-8">
            <p className="eyebrow mb-4">本週時尚快訊 · LIVE</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {news.map((n, i) => (
                <a
                  key={i}
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 py-2 group"
                  style={{ borderBottom: "1px solid var(--line)" }}
                >
                  <span className="text-sm leading-snug" style={{ color: "var(--fg)" }}>
                    {n.title}
                  </span>
                  <span className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
                    {n.source} {fmtDate(n.date)}
                    <ArrowUpRight size={12} style={{ color: "var(--accent)" }} />
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        <p className="text-sm mb-8" style={{ color: "var(--fg-dim)" }}>
          以下八大趨勢由編輯室策展 點任一張可展開「這樣穿」公式與真實穿搭範例
        </p>

        {loading ? (
          <p style={{ color: "var(--fg-dim)" }}>載入中</p>
        ) : (
          <>
            {/* 八大趨勢卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {SS_2026_TRENDS.trends.map((trend, i) => (
                <TrendCard
                  key={trend.id}
                  trend={trend}
                  index={i}
                  open={openTrend === trend.id}
                  onToggle={() => setOpenTrend(openTrend === trend.id ? null : trend.id)}
                />
              ))}
            </div>

            {items.length > 0 && (
              <section className="pt-12" style={{ borderTop: "1px solid var(--line)" }}>
                <p className="eyebrow mb-2">FROM YOUR WARDROBE</p>
                <h2 className="serif text-2xl mb-6">可呼應趨勢的衣櫥單品</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {items.slice(0, 12).map((it) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={it.id}
                      src={it.primary_image_url}
                      alt=""
                      className="w-full"
                      style={{ aspectRatio: "1", objectFit: "cover", background: "var(--bg-elev)", borderRadius: 4 }}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function TrendCard({
  trend,
  index,
  open,
  onToggle,
}: {
  trend: Trend;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const pinterestUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(trend.searchQuery)}`;
  const vogueUrl = `https://www.vogue.com/search?q=${encodeURIComponent(trend.searchQuery)}`;

  return (
    <article className="card" style={{ borderColor: open ? "var(--accent)" : "var(--accent-soft)", padding: 0, overflow: "hidden" }}>
      <button onClick={onToggle} className="w-full text-left p-6" style={{ cursor: "pointer" }}>
        <div className="flex items-baseline justify-between mb-3 gap-3">
          <p className="text-xs" style={{ color: "var(--accent)", letterSpacing: "0.3em" }}>
            {String(index + 1).padStart(2, "0")}
          </p>
          <p className="text-xs" style={{ color: "var(--fg-muted)", letterSpacing: "0.1em" }}>
            {trend.source}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="serif text-2xl" style={{ letterSpacing: "-0.01em" }}>{trend.name}</h2>
          <ChevronDown
            size={18}
            style={{ color: "var(--fg-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}
          />
        </div>
        <p className="text-sm leading-relaxed mt-2" style={{ color: "var(--fg-dim)" }}>
          {trend.blurb}
        </p>
        <div className="flex gap-1.5 mt-4">
          {trend.colors.map((c, idx) => (
            <span key={idx} className="block w-7 h-7 rounded-sm" style={{ background: c, border: "1px solid var(--line)" }} />
          ))}
        </div>
      </button>

      {/* 展開內容 */}
      {open && (
        <div className="px-6 pb-6" style={{ borderTop: "1px solid var(--line)" }}>
          <p className="eyebrow mb-3 mt-5">這樣穿</p>
          <ul className="flex flex-col gap-2 mb-5">
            {trend.outfitFormulas.map((f, idx) => (
              <li key={idx} className="text-sm flex items-baseline gap-2" style={{ color: "var(--fg)" }}>
                <span style={{ color: "var(--accent)" }}>—</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <p className="eyebrow mb-2">關鍵單品</p>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {trend.keyPieces.map((kp, idx) => (
              <span key={idx} className="tag">{kp}</span>
            ))}
          </div>

          <p className="eyebrow mb-3">看真實穿搭範例</p>
          <div className="flex gap-3">
            <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-1.5 text-xs">
              Pinterest <ArrowUpRight size={12} />
            </a>
            <a href={vogueUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-1.5 text-xs">
              Vogue <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      )}
    </article>
  );
}
