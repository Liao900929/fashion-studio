"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
import type { ClothingItem, TrendCache } from "@/types";
import { RefreshCw, Loader2 } from "lucide-react";

function currentSeasonKey(): string {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  if (m >= 3 && m <= 5) return `${y}-spring`;
  if (m >= 6 && m <= 8) return `${y}-summer`;
  if (m >= 9 && m <= 11) return `${y}-fall`;
  return `${y}-winter`;
}

const SEASON_LABEL: Record<string, string> = {
  spring: "春", summer: "夏", fall: "秋", winter: "冬",
};

export default function InspirePage() {
  const supabase = createSupabaseBrowser();
  const [trend, setTrend] = useState<TrendCache | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const key = currentSeasonKey();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [{ data: tData }, { data: iData }] = await Promise.all([
      supabase.from("trend_cache").select("*").eq("season_key", key).single(),
      supabase.from("clothing_items").select("*").limit(20),
    ]);
    setTrend((tData as TrendCache) ?? null);
    setItems((iData as ClothingItem[]) ?? []);
    setLoading(false);
  }

  const [disabledMsg, setDisabledMsg] = useState("");

  async function refresh() {
    setRefreshing(true);
    setDisabledMsg("");
    try {
      const res = await fetch("/api/trends/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasonKey: key }),
      });
      const data = await res.json();
      if (data.disabled) {
        setDisabledMsg(data.message ?? "趨勢生成需要 AI 金鑰");
      } else {
        await load();
      }
    } finally {
      setRefreshing(false);
    }
  }

  const [yearStr, seasonStr] = key.split("-");
  const seasonZh = SEASON_LABEL[seasonStr] ?? seasonStr;

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />

      <main className="flex-1 px-6 md:px-10 py-10 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-2">SEASONAL INSPIRATION</p>
            <h1 className="serif text-4xl md:text-5xl">{yearStr} {seasonZh}季趨勢</h1>
            {trend && (
              <p className="text-xs mt-2" style={{ color: "var(--fg-muted)" }}>
                最後更新：{new Date(trend.refreshed_at).toLocaleDateString("zh-TW")} · 由 Yuki AI 整理
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={refresh} disabled={refreshing} className="btn-ghost flex items-center gap-2">
              {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {refreshing ? "更新中..." : trend ? "重新整理趨勢" : "立刻生成趨勢"}
            </button>
            {disabledMsg && (
              <p className="text-xs" style={{ color: "var(--accent)" }}>⚠ {disabledMsg}</p>
            )}
          </div>
        </div>

        {loading ? (
          <p style={{ color: "var(--fg-dim)" }}>載入趨勢中...</p>
        ) : !trend ? (
          <EmptyTrends />
        ) : (
          <div className="space-y-12">
            {/* Summary */}
            <section>
              <p className="eyebrow mb-3">OVERVIEW</p>
              <p className="serif italic text-2xl md:text-3xl leading-relaxed" style={{ color: "var(--fg)" }}>
                「{trend.trends.summary}」
              </p>
            </section>

            <div className="divider-accent"></div>

            {/* Key Styles */}
            <Section title="關鍵風格" subtitle="KEY STYLES">
              <div className="flex flex-wrap gap-3">
                {trend.trends.key_styles?.map((s) => (
                  <span key={s} className="tag tag-accent" style={{ fontSize: "0.9rem", padding: "0.4rem 1rem" }}>
                    {s}
                  </span>
                ))}
              </div>
            </Section>

            {/* Colors */}
            <Section title="主打色" subtitle="PALETTE">
              <div className="flex gap-4 flex-wrap">
                {trend.trends.colors?.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20" style={{ background: c.hex, border: "1px solid var(--line)" }} />
                    <p className="text-xs" style={{ color: "var(--fg-dim)" }}>{c.name}</p>
                    <p className="text-xs serif italic" style={{ color: "var(--fg-muted)" }}>{c.hex}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Silhouettes */}
            <Section title="輪廓剪裁" subtitle="SILHOUETTES">
              <ul className="space-y-2">
                {trend.trends.silhouettes?.map((s, i) => (
                  <li key={i} className="serif text-lg flex items-baseline gap-3">
                    <span style={{ color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Key Pieces */}
            <Section title="必備單品" subtitle="KEY PIECES">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {trend.trends.key_pieces?.map((p, i) => (
                  <div key={i} className="card p-4">
                    <p className="text-xs" style={{ color: "var(--accent)" }}>0{i + 1}</p>
                    <p className="serif text-lg mt-1">{p}</p>
                  </div>
                ))}
              </div>
            </Section>

            {items.length > 0 && (
              <>
                <div className="divider-accent"></div>
                <Section title="你衣櫥裡可以配合的單品" subtitle="FROM YOUR WARDROBE">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {items.slice(0, 12).map((it) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={it.id} src={it.primary_image_url} alt="" className="w-full" style={{ aspectRatio: "1", objectFit: "cover", background: "var(--bg-elev)", borderRadius: 4 }} />
                    ))}
                  </div>
                </Section>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="eyebrow mb-2">{subtitle}</p>
      <h2 className="serif text-2xl md:text-3xl mb-5">{title}</h2>
      {children}
    </section>
  );
}

function EmptyTrends() {
  return (
    <div className="text-center py-24">
      <p className="serif text-6xl mb-4" style={{ color: "var(--accent)", opacity: 0.5 }}>✦</p>
      <h2 className="serif text-2xl mb-2">當季趨勢還沒有準備好</h2>
      <p className="text-sm mb-6" style={{ color: "var(--fg-dim)" }}>
        點上方的按鈕，讓 Yuki AI 為你整理當季時裝週重點。
      </p>
    </div>
  );
}
