"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
import type { ClothingItem, Outfit } from "@/types";
import { Plus } from "lucide-react";

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [itemMap, setItemMap] = useState<Record<string, ClothingItem>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createSupabaseBrowser();
    const [{ data: oData }, { data: iData }] = await Promise.all([
      supabase.from("outfits").select("*").order("created_at", { ascending: false }),
      supabase.from("clothing_items").select("*"),
    ]);
    setOutfits((oData as Outfit[]) ?? []);
    const map: Record<string, ClothingItem> = {};
    for (const i of (iData as ClothingItem[]) ?? []) map[i.id] = i;
    setItemMap(map);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />

      <main className="flex-1 px-6 md:px-10 py-10">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-2">OUTFIT EDIT</p>
            <h1 className="serif text-4xl md:text-5xl">我的搭配</h1>
            <p className="text-sm mt-2" style={{ color: "var(--fg-dim)" }}>
              共 {outfits.length} 套組合
            </p>
          </div>
          <Link href="/outfits/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} />新增搭配
          </Link>
        </div>

        {loading ? (
          <p style={{ color: "var(--fg-dim)" }}>載入中...</p>
        ) : outfits.length === 0 ? (
          <div className="text-center py-24">
            <p className="serif text-6xl mb-4" style={{ color: "var(--accent)", opacity: 0.5 }}>∅</p>
            <h2 className="serif text-2xl mb-2">還沒有搭配組合</h2>
            <p className="text-sm mb-6" style={{ color: "var(--fg-dim)" }}>
              組合 2-5 件單品，AI 會給你造型師等級的評語。
            </p>
            <Link href="/outfits/new" className="btn-primary">新增第一套搭配</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((o) => (
              <OutfitCard key={o.id} outfit={o} itemMap={itemMap} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function OutfitCard({ outfit, itemMap }: { outfit: Outfit; itemMap: Record<string, ClothingItem> }) {
  const items = outfit.item_ids.map((id) => itemMap[id]).filter(Boolean);
  return (
    <Link href={`/outfits/${outfit.id}`} className="block">
      <div className="card overflow-hidden" style={{ padding: 0 }}>
        <div className="grid grid-cols-2" style={{ aspectRatio: "1" }}>
          {items.slice(0, 4).map((it, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={it.primary_image_url} alt="" className="w-full h-full object-cover" style={{ background: "var(--bg-elev-2)" }} />
          ))}
          {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: "var(--bg-elev-2)" }} />
          ))}
        </div>
        <div className="p-4">
          <p className="eyebrow mb-1">{outfit.occasion ?? "日常"}</p>
          <h3 className="serif text-lg mb-2">{outfit.name}</h3>
          <p className="text-xs" style={{ color: "var(--fg-dim)" }}>
            {items.length} 件單品
          </p>
        </div>
      </div>
    </Link>
  );
}
