"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { Brand } from "@/types";

type Props = {
  brands: Brand[];
  value: string;                    // 選中的 brand id（"" = 未選）
  onChange: (brandId: string) => void;
  onBrandsUpdated: (brands: Brand[]) => void;
};

export default function BrandCombobox({ brands, value, onChange, onBrandsUpdated }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 顯示已選品牌名稱
  const selectedBrand = brands.find((b) => b.id === value);

  useEffect(() => {
    // 初始把已選品牌名稱填入輸入框
    if (selectedBrand && !query) setQuery(selectedBrand.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand?.id]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands.slice(0, 50);
    return brands.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 50);
  }, [brands, query]);

  const exactMatch = brands.some((b) => b.name.toLowerCase() === query.trim().toLowerCase());

  function selectBrand(b: Brand) {
    onChange(b.id);
    setQuery(b.name);
    setOpen(false);
  }

  async function addBrand() {
    const name = query.trim();
    if (!name || adding) return;
    setAdding(true);
    try {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未登入");
      const { data: b, error } = await supabase
        .from("brands")
        .insert({ name, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      const newBrand = b as Brand;
      onBrandsUpdated([...brands, newBrand].sort((a, z) => a.name.localeCompare(z.name)));
      onChange(newBrand.id);
      setQuery(newBrand.name);
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        className="input"
        value={query}
        placeholder="搜尋或輸入品牌名稱"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(""); // 一旦改字就清除原選取
        }}
      />

      {open && (
        <div
          className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-auto"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--line)",
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(31,26,21,0.12)",
          }}
        >
          {filtered.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => selectBrand(b)}
              className="block w-full text-left px-3 py-2 text-sm transition-colors"
              style={{
                color: b.id === value ? "var(--accent)" : "var(--fg)",
                background: b.id === value ? "var(--bg-elev-2)" : "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elev-2)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = b.id === value ? "var(--bg-elev-2)" : "transparent")
              }
            >
              {b.name}
              {b.user_id && (
                <span className="ml-2 text-xs" style={{ color: "var(--fg-muted)" }}>
                  自訂
                </span>
              )}
            </button>
          ))}

          {/* 找不到完全符合 → 新增選項 */}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={addBrand}
              disabled={adding}
              className="block w-full text-left px-3 py-2 text-sm"
              style={{ color: "var(--accent)", borderTop: "1px solid var(--line)" }}
            >
              {adding ? "新增中..." : `+ 新增「${query.trim()}」`}
            </button>
          )}

          {filtered.length === 0 && !query.trim() && (
            <p className="px-3 py-2 text-xs" style={{ color: "var(--fg-muted)" }}>
              開始輸入以搜尋品牌
            </p>
          )}
        </div>
      )}
    </div>
  );
}
