"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
import { CATEGORY_LABELS, type ClothingItem, type Outfit } from "@/types";
import { Trash2, Sparkles, Loader2 } from "lucide-react";

export default function OutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createSupabaseBrowser();

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [regen, setRegen] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const { data: o } = await supabase.from("outfits").select("*").eq("id", id).single();
    if (!o) {
      setLoading(false);
      return;
    }
    setOutfit(o as Outfit);
    if (o.item_ids?.length) {
      const { data: its } = await supabase.from("clothing_items").select("*").in("id", o.item_ids);
      setItems((its as ClothingItem[]) ?? []);
    }
    setLoading(false);
  }

  async function regenAdvice() {
    if (!outfit) return;
    setRegen(true);
    const res = await fetch("/api/style-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: outfit.item_ids, occasion: outfit.occasion }),
    });
    if (res.ok) {
      const data = await res.json();
      await supabase.from("outfits").update({ ai_advice: data.advice }).eq("id", id);
      load();
    }
    setRegen(false);
  }

  async function deleteOutfit() {
    if (!confirm("確定要刪除這套搭配嗎？")) return;
    await supabase.from("outfits").delete().eq("id", id);
    router.push("/outfits");
  }

  async function markWornToday() {
    if (!outfit) return;
    await supabase.from("outfits").update({ worn_at: new Date().toISOString() }).eq("id", id);
    // bump each item's wear count
    for (const it of items) {
      await supabase.from("clothing_items").update({
        times_worn: it.times_worn + 1,
        last_worn_at: new Date().toISOString(),
      }).eq("id", it.id);
    }
    load();
  }

  if (loading) return <PageShell><p style={{ color: "var(--fg-dim)" }}>載入中...</p></PageShell>;
  if (!outfit) return <PageShell><p style={{ color: "var(--fg-dim)" }}>找不到搭配。</p></PageShell>;

  return (
    <PageShell>
      <Link href="/outfits" className="text-xs uppercase tracking-widest mb-6 inline-block" style={{ color: "var(--fg-dim)" }}>
        ← 回到搭配列表
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Items collage */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            {items.map((it) => (
              <Link key={it.id} href={`/wardrobe/${it.id}`} className="card overflow-hidden block" style={{ padding: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.primary_image_url} alt="" className="w-full block" style={{ aspectRatio: "1", objectFit: "cover" }} />
                <div className="p-2">
                  <p className="text-xs uppercase tracking-widest" style={{ color: "var(--fg-dim)" }}>
                    {CATEGORY_LABELS[it.category].zh}
                  </p>
                  <p className="text-xs serif italic" style={{ color: "var(--fg-muted)" }}>
                    {it.color_name} {it.material}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="eyebrow mb-2">{outfit.occasion ?? "日常"}</p>
          <h1 className="serif text-4xl md:text-5xl mb-3">{outfit.name}</h1>
          <p className="text-sm mb-8" style={{ color: "var(--fg-dim)" }}>
            建立於 {new Date(outfit.created_at).toLocaleDateString("zh-TW")} · 包含 {items.length} 件單品
          </p>

          {outfit.ai_advice && (
            <div className="card p-5 mb-6" style={{ borderColor: "var(--accent-soft)" }}>
              <p className="eyebrow mb-3" style={{ color: "var(--accent)" }}>Yuki 的造型評語</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--fg)" }}>
                {outfit.ai_advice}
              </p>
            </div>
          )}

          <button onClick={regenAdvice} disabled={regen} className="btn-ghost w-full mb-3 flex items-center justify-center gap-2">
            {regen ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {regen ? "重新分析中..." : outfit.ai_advice ? "重新分析" : "獲取 AI 評語"}
          </button>

          {outfit.worn_at && (
            <p className="text-xs mb-3 text-center" style={{ color: "var(--accent)" }}>
              ✓ 最近一次穿著：{new Date(outfit.worn_at).toLocaleDateString("zh-TW")}
            </p>
          )}

          <button onClick={markWornToday} className="btn-primary w-full mb-3">今天就穿這套</button>

          <button onClick={deleteOutfit} className="btn-ghost w-full flex items-center justify-center gap-2" style={{ color: "var(--danger)" }}>
            <Trash2 size={14} />刪除這套搭配
          </button>
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <main className="flex-1 px-6 md:px-10 py-10 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}
