"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
import ItemCard from "@/components/ItemCard";
import { CATEGORY_LABELS, type Category, type ClothingItem } from "@/types";
import { Plus } from "lucide-react";

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category | "all">("all");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createSupabaseBrowser();
    const { data } = await supabase
      .from("clothing_items")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as ClothingItem[]) ?? []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const it of items) c[it.category] = (c[it.category] ?? 0) + 1;
    return c;
  }, [items]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />

      <main className="flex-1 px-6 md:px-10 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-2">YOUR WARDROBE</p>
            <h1 className="serif text-4xl md:text-5xl">我的衣櫥</h1>
            <p className="text-sm mt-2" style={{ color: "var(--fg-dim)" }}>
              共 {items.length} 件單品
            </p>
          </div>
          <Link href="/wardrobe/upload" className="btn-primary flex items-center gap-2">
            <Plus size={16} />新增單品
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-10 pb-6" style={{ borderBottom: "1px solid var(--line)" }}>
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            全部 · {items.length}
          </FilterChip>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
            const n = counts[cat] ?? 0;
            if (n === 0) return null;
            return (
              <FilterChip key={cat} active={filter === cat} onClick={() => setFilter(cat)}>
                {CATEGORY_LABELS[cat].emoji} {CATEGORY_LABELS[cat].zh} · {n}
              </FilterChip>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <p style={{ color: "var(--fg-dim)" }}>載入衣櫥中...</p>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="masonry">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-xs uppercase tracking-widest transition-all"
      style={{
        background: active ? "var(--fg)" : "transparent",
        color: active ? "var(--bg)" : "var(--fg-dim)",
        border: `1px solid ${active ? "var(--fg)" : "var(--line)"}`,
        borderRadius: 2,
      }}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <p className="serif text-6xl mb-4" style={{ color: "var(--accent)", opacity: 0.5 }}>∅</p>
      <h2 className="serif text-2xl mb-2">衣櫥還是空的</h2>
      <p className="text-sm mb-6" style={{ color: "var(--fg-dim)" }}>
        從一件最喜歡的單品開始拍照吧。
      </p>
      <Link href="/wardrobe/upload" className="btn-primary">上傳第一件單品</Link>
    </div>
  );
}
