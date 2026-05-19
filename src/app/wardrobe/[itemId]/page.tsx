"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
import Carousel360 from "@/components/Carousel360";
import { CATEGORY_LABELS, SEASON_LABELS, type Brand, type ClothingItem } from "@/types";
import { Trash2, TrendingUp } from "lucide-react";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;
  const supabase = createSupabaseBrowser();

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [itemId]);

  async function load() {
    const { data } = await supabase
      .from("clothing_items")
      .select("*")
      .eq("id", itemId)
      .single();
    setItem(data as ClothingItem);
    if (data?.brand_id) {
      const { data: b } = await supabase.from("brands").select("*").eq("id", data.brand_id).single();
      setBrand(b as Brand);
    }
    setLoading(false);
  }

  async function deleteItem() {
    if (!confirm("確定要刪除這件單品嗎？")) return;
    await supabase.from("clothing_items").delete().eq("id", itemId);
    router.push("/wardrobe");
  }

  async function markWorn() {
    if (!item) return;
    await supabase
      .from("clothing_items")
      .update({
        times_worn: item.times_worn + 1,
        last_worn_at: new Date().toISOString(),
      })
      .eq("id", itemId);
    load();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppNav />
        <main className="flex-1 px-6 py-10 text-center" style={{ color: "var(--fg-dim)" }}>
          載入中...
        </main>
      </div>
    );
  }
  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppNav />
        <main className="flex-1 px-6 py-10 text-center" style={{ color: "var(--fg-dim)" }}>
          找不到該單品。<Link href="/wardrobe" className="underline">回到衣櫥</Link>
        </main>
      </div>
    );
  }

  const cat = CATEGORY_LABELS[item.category];

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />

      <main className="flex-1 px-6 md:px-10 py-10 max-w-6xl mx-auto w-full">
        <Link href="/wardrobe" className="text-xs uppercase tracking-widest mb-6 inline-block" style={{ color: "var(--fg-dim)" }}>
          ← 回到衣櫥
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image carousel */}
          <Carousel360 images={item.angle_image_urls?.length ? item.angle_image_urls : [item.primary_image_url]} />

          {/* Details */}
          <div>
            <p className="eyebrow mb-2">{cat.zh}</p>
            <h1 className="serif text-4xl md:text-5xl mb-2">
              {brand?.name ?? "未指定品牌"}
            </h1>
            <p className="serif italic text-lg mb-6" style={{ color: "var(--fg-dim)" }}>
              {item.color_name} {item.material}
            </p>

            {item.palette && Array.isArray(item.palette) && (
              <div className="mb-8">
                <p className="eyebrow mb-3">PALETTE</p>
                <div className="flex gap-2">
                  {item.palette.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-12 h-12 rounded-sm"
                        style={{ background: c, border: "1px solid var(--line)" }}
                      />
                      <span className="text-xs" style={{ color: "var(--fg-muted)" }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.season?.length > 0 && (
              <div className="mb-8">
                <p className="eyebrow mb-3">SEASON</p>
                <div className="flex gap-2">
                  {item.season.map((s) => (
                    <span key={s} className="tag tag-accent">{SEASON_LABELS[s]}季</span>
                  ))}
                </div>
              </div>
            )}

            {/* Wear stats */}
            <div className="mb-8 p-5 card flex items-center justify-between" style={{ borderColor: "var(--accent-soft)" }}>
              <div>
                <p className="eyebrow mb-1">穿著紀錄</p>
                <p className="serif text-2xl">
                  穿過 <span style={{ color: "var(--accent)" }}>{item.times_worn}</span> 次
                </p>
                {item.last_worn_at && (
                  <p className="text-xs mt-1" style={{ color: "var(--fg-dim)" }}>
                    最後一次：{new Date(item.last_worn_at).toLocaleDateString("zh-TW")}
                  </p>
                )}
              </div>
              <button onClick={markWorn} className="btn-ghost flex items-center gap-2">
                <TrendingUp size={14} />今天穿了
              </button>
            </div>

            {item.notes && (
              <div className="mb-8">
                <p className="eyebrow mb-2">NOTES</p>
                <p className="text-sm" style={{ color: "var(--fg-dim)" }}>{item.notes}</p>
              </div>
            )}

            <div className="divider-accent mb-6"></div>

            <div className="flex gap-3">
              <Link href={`/outfits/new?item=${item.id}`} className="btn-primary flex-1 text-center">
                加入搭配
              </Link>
              <button onClick={deleteItem} className="btn-ghost flex items-center gap-2" style={{ color: "var(--danger)" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
