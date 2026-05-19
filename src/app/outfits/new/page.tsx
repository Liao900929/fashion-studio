"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
import { CATEGORY_LABELS, type ClothingItem, type Category } from "@/types";
import { analyzeOutfit } from "@/lib/trends/ss-2026";
import { X, Sparkles, Loader2 } from "lucide-react";

const OCCASIONS = ["日常", "上班", "約會", "派對", "運動", "正式場合"];

export default function NewOutfitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ color: "var(--fg-dim)" }}>載入中...</div>}>
      <NewOutfitInner />
    </Suspense>
  );
}

function NewOutfitInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowser();

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("日常");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [advice, setAdvice] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("clothing_items")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as ClothingItem[]) ?? []);
        // Auto-select from URL param
        const initial = searchParams.get("item");
        if (initial) setSelected([initial]);
      });
  }, []);

  function toggle(id: string) {
    setSelected((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  }

  async function getAdvice() {
    if (selected.length === 0) return;
    setLoadingAdvice(true);
    setError("");
    try {
      const res = await fetch("/api/style-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: selected, occasion }),
      });
      const data = await res.json();
      if (data.disabled) {
        setError(data.message ?? "AI 評語未啟用");
      } else if (!res.ok || data.error) {
        throw new Error(data.error ?? "AI 評語失敗");
      } else {
        setAdvice(data.advice);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 評語失敗");
    } finally {
      setLoadingAdvice(false);
    }
  }

  async function save() {
    if (selected.length === 0 || !name.trim()) {
      setError("請至少選 1 件單品並填上搭配名稱");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未登入");

      const coverItem = items.find((i) => i.id === selected[0]);
      const { data: outfit, error: err } = await supabase
        .from("outfits")
        .insert({
          user_id: user.id,
          name: name.trim(),
          cover_image_url: coverItem?.primary_image_url,
          item_ids: selected,
          occasion,
          ai_advice: advice || null,
        })
        .select()
        .single();
      if (err) throw err;
      router.push(`/outfits/${outfit.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
      setSaving(false);
    }
  }

  const filteredItems = filter === "all" ? items : items.filter((i) => i.category === filter);
  const selectedItems = items.filter((i) => selected.includes(i.id));

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />

      <main className="flex-1 px-6 md:px-10 py-10 max-w-7xl mx-auto w-full">
        <Link href="/outfits" className="text-xs uppercase tracking-widest mb-6 inline-block" style={{ color: "var(--fg-dim)" }}>
          ← 回到搭配列表
        </Link>

        <p className="eyebrow mb-2">NEW OUTFIT</p>
        <h1 className="serif text-4xl md:text-5xl mb-10">組合新的搭配</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
          {/* Left: select items */}
          <div>
            <p className="eyebrow mb-3">SELECT ITEMS · {selected.length} 件已選</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter("all")}
                className="tag"
                style={filter === "all" ? { background: "var(--fg)", color: "var(--bg)", borderColor: "var(--fg)" } : {}}
              >
                全部
              </button>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => {
                if (!items.some((i) => i.category === c)) return null;
                return (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className="tag"
                    style={filter === c ? { background: "var(--fg)", color: "var(--bg)", borderColor: "var(--fg)" } : {}}
                  >
                    {CATEGORY_LABELS[c].zh}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredItems.map((item) => {
                const isSel = selected.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className="relative card overflow-hidden block"
                    style={{
                      padding: 0,
                      borderColor: isSel ? "var(--accent)" : "var(--line)",
                      borderWidth: isSel ? 2 : 1,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.primary_image_url} alt="" className="w-full block" style={{ aspectRatio: "1", objectFit: "cover" }} />
                    {isSel && (
                      <span className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full text-xs" style={{ background: "var(--accent)", color: "var(--bg)" }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {items.length === 0 && (
              <p className="text-sm py-12 text-center" style={{ color: "var(--fg-dim)" }}>
                還沒有單品，<Link href="/wardrobe/upload" className="underline" style={{ color: "var(--accent)" }}>先上傳幾件</Link>
              </p>
            )}
          </div>

          {/* Right: outfit composer */}
          <div className="lg:sticky lg:top-6 self-start">
            <div className="card p-6">
              <p className="eyebrow mb-4">YOUR OUTFIT</p>

              {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 pb-6" style={{ borderBottom: "1px solid var(--line)" }}>
                  {selectedItems.map((it) => (
                    <div key={it.id} className="relative" style={{ width: 64, height: 64 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.primary_image_url} alt="" className="w-full h-full object-cover" style={{ background: "var(--bg-elev-2)" }} />
                      <button
                        onClick={() => toggle(it.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full"
                        style={{ background: "var(--bg)", border: "1px solid var(--line)", color: "var(--fg)" }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>搭配名稱</label>
              <input
                className="input mb-5"
                placeholder="例：週末咖啡廳"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "var(--fg-dim)" }}>場合</label>
              <div className="flex flex-wrap gap-2 mb-5">
                {OCCASIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setOccasion(o)}
                    className="tag"
                    style={occasion === o ? { background: "var(--accent)", color: "var(--bg)", borderColor: "var(--accent)" } : {}}
                  >
                    {o}
                  </button>
                ))}
              </div>

              {/* 規則式推薦原因（免費 即時 ）*/}
              {selectedItems.length >= 2 && (() => {
                const insights = analyzeOutfit(selectedItems, occasion);
                if (insights.length === 0) return null;
                return (
                  <div className="mb-5">
                    <p className="eyebrow mb-3">為什麼這套可行</p>
                    <div className="flex flex-col gap-2">
                      {insights.map((ins, i) => (
                        <div
                          key={i}
                          className="p-3"
                          style={{
                            background: "var(--bg-elev-2)",
                            border: "1px solid var(--line)",
                            borderLeft: "2px solid var(--accent)",
                            borderRadius: 2,
                          }}
                        >
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--accent)", letterSpacing: "0.1em" }}>
                            {ins.title}
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--fg-dim)" }}>
                            {ins.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {advice && (
                <div className="mb-5 p-4" style={{ background: "var(--bg)", border: "1px solid var(--accent-soft)", borderRadius: 2 }}>
                  <p className="eyebrow mb-2" style={{ color: "var(--accent)" }}>Yuki AI 進階評語</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--fg)" }}>
                    {advice}
                  </p>
                </div>
              )}

              {error && <p className="text-xs mb-4" style={{ color: "var(--danger)" }}>{error}</p>}

              <button
                onClick={getAdvice}
                disabled={loadingAdvice || selected.length === 0}
                className="btn-ghost w-full mb-3 flex items-center justify-center gap-2"
                style={{ opacity: loadingAdvice || selected.length === 0 ? 0.5 : 1 }}
              >
                {loadingAdvice ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loadingAdvice ? "Yuki 思考中..." : "獲取 AI 造型評語"}
              </button>

              <button
                onClick={save}
                disabled={saving || selected.length === 0 || !name.trim()}
                className="btn-primary w-full"
                style={{ opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "儲存中..." : "存入搭配"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
