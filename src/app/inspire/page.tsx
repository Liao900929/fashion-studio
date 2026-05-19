"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
import type { ClothingItem } from "@/types";
import { RefreshCw, Loader2 } from "lucide-react";
import { SS_2026_TRENDS } from "@/lib/trends/ss-2026";

export default function InspirePage() {
  const supabase = createSupabaseBrowser();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiDisabledMsg, setAiDisabledMsg] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: iData } = await supabase
      .from("clothing_items")
      .select("*")
      .limit(20);
    setItems((iData as ClothingItem[]) ?? []);
    setLoading(false);
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
      if (data.disabled) {
        setAiDisabledMsg(data.message ?? "AI 即時更新需要 Anthropic 金鑰");
      }
    } finally {
      setRefreshing(false);
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
          <div className="flex flex-col items-end gap-2">
            <button onClick={refresh} disabled={refreshing} className="btn-ghost flex items-center gap-2">
              {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {refreshing ? "AI 更新中" : "AI 進階版即時更新"}
            </button>
            {aiDisabledMsg && (
              <p className="text-xs" style={{ color: "var(--accent)" }}>{aiDisabledMsg}</p>
            )}
          </div>
        </div>

        <p className="text-sm mb-12" style={{ color: "var(--fg-dim)" }}>
          以下八大趨勢由編輯室策展 根據 Vogue Elle 與各大時裝週公開資訊整理 不需要付費即可查看
        </p>

        {loading ? (
          <p style={{ color: "var(--fg-dim)" }}>載入中</p>
        ) : (
          <>
            {/* 八大趨勢卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {SS_2026_TRENDS.trends.map((trend, i) => (
                <article key={trend.id} className="card p-6" style={{ borderColor: "var(--accent-soft)" }}>
                  <div className="flex items-baseline justify-between mb-3 gap-3">
                    <p className="text-xs" style={{ color: "var(--accent)", letterSpacing: "0.3em" }}>
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="text-xs" style={{ color: "var(--fg-muted)", letterSpacing: "0.15em" }}>
                      {trend.source}
                    </p>
                  </div>
                  <h2 className="serif text-2xl mb-2" style={{ letterSpacing: "-0.01em" }}>
                    {trend.name}
                  </h2>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--fg-dim)" }}>
                    {trend.blurb}
                  </p>

                  {/* 主色 */}
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--fg-muted)" }}>
                    主打色
                  </p>
                  <div className="flex gap-1.5 mb-4">
                    {trend.colors.map((c, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div
                          className="w-10 h-10 rounded-sm"
                          style={{ background: c, border: "1px solid var(--line)" }}
                        />
                        <span className="text-[10px]" style={{ color: "var(--fg-muted)" }}>{c}</span>
                      </div>
                    ))}
                  </div>

                  {/* 必備單品 */}
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--fg-muted)" }}>
                    關鍵單品
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {trend.keyPieces.map((kp, idx) => (
                      <span key={idx} className="tag">{kp}</span>
                    ))}
                  </div>

                  {/* 剪裁 */}
                  <p className="text-xs italic" style={{ color: "var(--fg-dim)" }}>
                    剪裁關鍵 {trend.silhouettes.join(" · ")}
                  </p>
                </article>
              ))}
            </div>

            {/* 你的衣櫥連結 */}
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
