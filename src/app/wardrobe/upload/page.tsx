"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";
import { removeBg } from "@/lib/backgroundRemoval";
import { CATEGORY_LABELS, type Category, type Brand, type Season, SEASON_LABELS } from "@/types";
import type { ClothingAnalysis } from "@/lib/ai/openai";
import { Camera, Upload, Loader2, X } from "lucide-react";

type Step = "capture" | "processing" | "review" | "saving";

export default function UploadPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [step, setStep] = useState<Step>("capture");
  const [angleFiles, setAngleFiles] = useState<{ original: File; processed: Blob; previewUrl: string }[]>([]);
  const [analysis, setAnalysis] = useState<ClothingAnalysis | null>(null);
  const [category, setCategory] = useState<Category>("top");
  const [material, setMaterial] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [season, setSeason] = useState<Season[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState<string>("");
  const [newBrand, setNewBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [processingMsg, setProcessingMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("brands")
      .select("*")
      .order("name")
      .then(({ data }) => setBrands((data as Brand[]) ?? []));
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setStep("processing");
    setErrorMsg("");

    const processed: typeof angleFiles = [];
    let i = 0;
    for (const f of Array.from(files).slice(0, 8)) {
      i++;
      setProcessingMsg(`正在去背第 ${i}/${files.length} 張...`);
      try {
        const removed = await removeBg(f);
        processed.push({
          original: f,
          processed: removed,
          previewUrl: URL.createObjectURL(removed),
        });
      } catch (err) {
        console.error(err);
        // Fallback: keep original
        processed.push({
          original: f,
          processed: f,
          previewUrl: URL.createObjectURL(f),
        });
      }
    }
    setAngleFiles(processed);

    // === 免費瀏覽器分析：顏色 + 品類 + 季節（全部本機跑、零成本）===
    try {
      setProcessingMsg("正在抽取主色...");
      const { extractColors, predictCategory, guessSeasons } = await import("@/lib/imageAnalysis");

      const colorRes = await extractColors(processed[0].processed);
      setColorHex(colorRes.dominantHex);
      setColorName(colorRes.dominantName);

      // 順便存 palette 到 analysis 物件供後續儲存
      const baseAnalysis = {
        category: "top" as Category,
        material: "",
        color_hex: colorRes.dominantHex,
        color_name: colorRes.dominantName,
        palette: colorRes.palette,
        season: guessSeasons(colorRes.dominantHex),
        description: "",
        style_tags: [],
      };
      setSeason(baseAnalysis.season);

      // 載入 MobileNet 第一次會下載模型（約 16MB，之後快取）
      setProcessingMsg("AI 正在猜測品類...");
      try {
        const catRes = await predictCategory(processed[0].processed);
        setCategory(catRes.category);
        baseAnalysis.category = catRes.category;
      } catch {
        // 模型載入失敗就跳過，使用者手動選
      }

      setAnalysis(baseAnalysis);
    } catch (err) {
      console.warn("免費分析失敗", err);
    }

    // === 進階 AI（OpenAI Vision，需金鑰）— 有的話會覆蓋上面的結果以更精準 ===
    try {
      const tempPath = `temp/${Date.now()}.png`;
      const { error: uploadErr } = await supabase.storage
        .from("clothing")
        .upload(tempPath, processed[0].processed, { contentType: "image/png", upsert: true });

      if (!uploadErr) {
        const { data: pub } = supabase.storage.from("clothing").getPublicUrl(tempPath);
        setProcessingMsg("OpenAI Vision 進階分析中...");
        const res = await fetch("/api/analyze-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: pub.publicUrl }),
        });
        const data = await res.json();
        if (!data.disabled && res.ok && !data.error) {
          const a = data as ClothingAnalysis;
          setAnalysis(a);
          if (a.category) setCategory(a.category as Category);
          if (a.material) setMaterial(a.material);
          if (a.color_name) setColorName(a.color_name);
          if (a.color_hex) setColorHex(a.color_hex);
          if (a.season) setSeason(a.season as Season[]);
        }
        await supabase.storage.from("clothing").remove([tempPath]);
      }
    } catch {
      // OpenAI 失敗不影響流程，免費分析的結果已經就位
    }

    setStep("review");
  }

  function skipAndManual() {
    // 直接跳到 review，全手動
    setStep("review");
  }

  async function save() {
    setStep("saving");
    setErrorMsg("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未登入");

      // Add new brand if specified
      let finalBrandId = brandId || null;
      if (newBrand.trim() && !brandId) {
        const { data: b, error: be } = await supabase
          .from("brands")
          .insert({ name: newBrand.trim(), user_id: user.id })
          .select()
          .single();
        if (be) throw be;
        finalBrandId = b.id;
      }

      // Upload all angle images
      const urls: string[] = [];
      for (let i = 0; i < angleFiles.length; i++) {
        const path = `${user.id}/${Date.now()}-${i}.png`;
        const { error: ue } = await supabase.storage
          .from("clothing")
          .upload(path, angleFiles[i].processed, { contentType: "image/png" });
        if (ue) throw ue;
        const { data: pub } = supabase.storage.from("clothing").getPublicUrl(path);
        urls.push(pub.publicUrl);
      }

      const { data: inserted, error: insertErr } = await supabase
        .from("clothing_items")
        .insert({
          user_id: user.id,
          primary_image_url: urls[0],
          angle_image_urls: urls,
          category,
          material: material || null,
          brand_id: finalBrandId,
          color_hex: colorHex || null,
          color_name: colorName || null,
          palette: analysis?.palette ?? null,
          season,
          ai_tags: analysis ? (analysis as unknown as Record<string, unknown>) : null,
          notes: notes || null,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      router.push(`/wardrobe/${inserted.id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "儲存失敗");
      setStep("review");
    }
  }

  function removeAngle(i: number) {
    setAngleFiles((arr) => arr.filter((_, idx) => idx !== i));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />

      <main className="flex-1 px-6 md:px-10 py-10 max-w-4xl mx-auto w-full">
        <Link href="/wardrobe" className="text-xs uppercase tracking-widest mb-6 inline-block" style={{ color: "var(--fg-dim)" }}>
          ← 回到衣櫥
        </Link>

        <p className="eyebrow mb-2">NEW ITEM</p>
        <h1 className="serif text-4xl md:text-5xl mb-2">上傳新單品</h1>
        <p className="text-sm mb-10" style={{ color: "var(--fg-dim)" }}>
          建議上傳 4-8 張不同角度照片 系統會自動去背 之後選擇品類 材質 顏色
        </p>

        {/* Step: Capture */}
        {step === "capture" && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-24 flex flex-col items-center justify-center gap-4 transition-all"
              style={{
                border: "2px dashed var(--line)",
                borderRadius: 4,
                color: "var(--fg-dim)",
              }}
            >
              <Upload size={48} style={{ color: "var(--accent)" }} />
              <span className="serif text-xl">點此選擇照片</span>
              <span className="text-xs uppercase tracking-widest">支援多選 · 最多 8 張</span>
            </button>

            <p className="mt-6 text-xs text-center" style={{ color: "var(--fg-muted)" }}>
              建議：白底光線充足、單品平鋪或掛起，多角度拍攝可啟用 360° 旋轉展示。
            </p>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="py-24 text-center">
            <Loader2 size={48} className="mx-auto mb-6 animate-spin" style={{ color: "var(--accent)" }} />
            <p className="serif text-xl mb-2">{processingMsg}</p>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>第一次使用會下載 AI 模型，需要等候約 30 秒</p>
          </div>
        )}

        {/* Step: Review */}
        {(step === "review" || step === "saving") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Images */}
            <div>
              <p className="eyebrow mb-3">PREVIEW · {angleFiles.length} 張角度</p>
              <div className="grid grid-cols-2 gap-2">
                {angleFiles.map((a, i) => (
                  <div key={i} className="relative card" style={{ padding: 0, overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.previewUrl} alt="" className="w-full block" />
                    <button
                      onClick={() => removeAngle(i)}
                      className="absolute top-1 right-1 p-1 rounded-full"
                      style={{ background: "rgba(0,0,0,0.7)", color: "var(--fg)" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {analysis && (
                <div className="mt-6">
                  <p className="eyebrow mb-2">AI 觀察</p>
                  <p className="text-sm italic serif" style={{ color: "var(--fg-dim)" }}>
                    「{analysis.description}」
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {analysis.style_tags?.map((t) => (
                      <span key={t} className="tag tag-accent">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div>
              <p className="eyebrow mb-4">CONFIRM DETAILS</p>

              <Field label="品類">
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c].emoji} {CATEGORY_LABELS[c].zh}</option>
                  ))}
                </select>
              </Field>

              <Field label="材質">
                <input className="input" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="cotton / denim / wool ..." />
              </Field>

              <Field label="顏色">
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={colorHex || "#888888"}
                    onChange={(e) => setColorHex(e.target.value)}
                    style={{ width: 40, height: 40, border: "1px solid var(--line)", background: "transparent" }}
                  />
                  <input className="input flex-1" value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder="顏色名稱" />
                </div>
              </Field>

              <Field label="品牌">
                <select className="input" value={brandId} onChange={(e) => { setBrandId(e.target.value); setNewBrand(""); }}>
                  <option value="">— 請選擇 —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {!brandId && (
                  <input
                    className="input mt-2"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="或新增品牌名稱"
                  />
                )}
              </Field>

              <Field label="季節（可複選）">
                <div className="flex gap-2 flex-wrap pt-2">
                  {(Object.keys(SEASON_LABELS) as Season[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeason((arr) => arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s])}
                      className="tag"
                      style={season.includes(s) ? { background: "var(--accent)", color: "var(--bg)", borderColor: "var(--accent)" } : {}}
                    >
                      {SEASON_LABELS[s]}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="筆記">
                <textarea
                  className="input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="購買日期、價格、靈感來源..."
                  rows={2}
                  style={{ resize: "none" }}
                />
              </Field>

              {errorMsg && (
                <p className="text-sm mb-4" style={{ color: "var(--danger)" }}>⚠ {errorMsg}</p>
              )}

              <button
                onClick={save}
                disabled={step === "saving" || angleFiles.length === 0}
                className="btn-primary w-full mt-4"
                style={{ opacity: step === "saving" ? 0.6 : 1 }}
              >
                {step === "saving" ? "儲存中..." : "存入衣櫥"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: "var(--fg-dim)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
