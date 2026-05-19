/**
 * 免費的瀏覽器端圖片分析
 * - 顏色：colorthief 純數學抽取主色與調色盤
 * - 品類：TensorFlow.js MobileNet 推測（ImageNet 1000 類映射到衣物分類）
 *
 * 全部在瀏覽器跑、零成本、不需 API 金鑰
 */

import type { Category, Season } from "@/types";

// ============================ 顏色 ============================

const COLOR_NAMES: { hex: string; zh: string }[] = [
  { hex: "#000000", zh: "黑色" },
  { hex: "#1F1A15", zh: "墨色" },
  { hex: "#3a2a1c", zh: "深棕" },
  { hex: "#6b4f3a", zh: "咖啡色" },
  { hex: "#8b6f47", zh: "卡其色" },
  { hex: "#B25A36", zh: "焙焦赭土" },
  { hex: "#c9a96e", zh: "香檳金" },
  { hex: "#d4c5a8", zh: "米色" },
  { hex: "#f5f1ea", zh: "奶白色" },
  { hex: "#ffffff", zh: "純白" },
  { hex: "#e85d4a", zh: "磚紅" },
  { hex: "#a85f3e", zh: "陶土" },
  { hex: "#f5b97a", zh: "蜜桃色" },
  { hex: "#fde68a", zh: "麥黃" },
  { hex: "#86efac", zh: "薄荷綠" },
  { hex: "#5a7a4d", zh: "橄欖綠" },
  { hex: "#1f3a2c", zh: "森林綠" },
  { hex: "#6db4d0", zh: "天空藍" },
  { hex: "#3a4f6b", zh: "靛藍" },
  { hex: "#1a1f2b", zh: "藏青" },
  { hex: "#d4b0c0", zh: "粉色" },
  { hex: "#a85b50", zh: "玫瑰" },
  { hex: "#3b0764", zh: "紫色" },
  { hex: "#888888", zh: "灰色" },
  { hex: "#bdbdbd", zh: "淺灰" },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("")}`;
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function nearestColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  let nearest = COLOR_NAMES[0];
  let minDist = Infinity;
  for (const c of COLOR_NAMES) {
    const d = colorDistance(rgb, hexToRgb(c.hex));
    if (d < minDist) {
      minDist = d;
      nearest = c;
    }
  }
  return nearest.zh;
}

export type ColorResult = {
  dominantHex: string;
  dominantName: string;
  palette: string[];
};

export async function extractColors(blobOrUrl: Blob | string): Promise<ColorResult> {
  const { default: ColorThief } = await import("colorthief");

  const img = new Image();
  img.crossOrigin = "anonymous";

  const url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  img.src = url;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
  });

  const thief = new ColorThief();
  const dominant = thief.getColor(img) as [number, number, number];
  const palette = (thief.getPalette(img, 5) as [number, number, number][]) ?? [];

  if (typeof blobOrUrl !== "string") URL.revokeObjectURL(url);

  const dominantHex = rgbToHex(...dominant);
  return {
    dominantHex,
    dominantName: nearestColorName(dominantHex),
    palette: palette.map((c) => rgbToHex(...c)),
  };
}

// ============================ 品類 ============================

// ImageNet → 我們 10 個品類的映射（涵蓋常見類別）
const CATEGORY_KEYWORDS: { keywords: string[]; category: Category }[] = [
  { category: "hat", keywords: ["hat", "cap", "bonnet", "helmet", "sombrero", "beanie", "beret"] },
  { category: "shirt", keywords: ["shirt", "jersey", "tee", "polo"] },
  { category: "top", keywords: ["sweatshirt", "pullover", "sweater", "vest", "tank", "cardigan"] },
  { category: "jacket", keywords: ["jacket", "coat", "trench", "parka", "blazer", "windbreaker", "anorak", "raincoat", "overcoat"] },
  { category: "bottom", keywords: ["jean", "trouser", "pant", "short"] },
  { category: "skirt", keywords: ["skirt", "miniskirt", "kimono"] },
  { category: "shoes", keywords: ["shoe", "sneaker", "loafer", "boot", "sandal", "clog", "running shoe", "cowboy boot"] },
  { category: "bag", keywords: ["bag", "handbag", "purse", "backpack", "wallet", "tote"] },
  { category: "accessory", keywords: ["watch", "necklace", "scarf", "tie", "belt", "sunglasses", "glasses", "earring", "ring"] },
];

function mapImageNetToCategory(label: string): Category | null {
  const l = label.toLowerCase();
  for (const m of CATEGORY_KEYWORDS) {
    if (m.keywords.some((k) => l.includes(k))) return m.category;
  }
  return null;
}

let _mobilenetModelPromise: Promise<unknown> | null = null;
async function loadMobilenet() {
  if (!_mobilenetModelPromise) {
    _mobilenetModelPromise = (async () => {
      // 動態載入避免 SSR 與初始 bundle bloat
      await import("@tensorflow/tfjs");
      const mn = await import("@tensorflow-models/mobilenet");
      return mn.load({ version: 2, alpha: 1.0 });
    })();
  }
  return _mobilenetModelPromise;
}

export type CategoryResult = {
  category: Category;
  confidence: number;
  rawLabel: string;
};

export async function predictCategory(blobOrUrl: Blob | string): Promise<CategoryResult> {
  const img = new Image();
  img.crossOrigin = "anonymous";

  const url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  img.src = url;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
  });

  const model = (await loadMobilenet()) as { classify: (img: HTMLImageElement, topK?: number) => Promise<{ className: string; probability: number }[]> };
  const predictions = await model.classify(img, 5);

  if (typeof blobOrUrl !== "string") URL.revokeObjectURL(url);

  // 找第一個能對到衣物分類的預測
  for (const p of predictions) {
    const cat = mapImageNetToCategory(p.className);
    if (cat) {
      return {
        category: cat,
        confidence: p.probability,
        rawLabel: p.className,
      };
    }
  }

  // 都對不到就回 'other'
  return {
    category: "other",
    confidence: predictions[0]?.probability ?? 0,
    rawLabel: predictions[0]?.className ?? "unknown",
  };
}

// 季節偵測（根據主色亮度與飽和度的簡單啟發式 — 純啟發式不需 AI）
export function guessSeasons(hex: string): Season[] {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2 / 255;
  const saturation = max === 0 ? 0 : (max - min) / max;

  const seasons: Season[] = [];
  if (lightness > 0.7) seasons.push("spring", "summer");
  if (lightness < 0.3) seasons.push("fall", "winter");
  if (lightness >= 0.3 && lightness <= 0.7) {
    if (saturation > 0.4) seasons.push("spring", "fall");
    else seasons.push("fall", "winter");
  }
  return Array.from(new Set(seasons));
}
