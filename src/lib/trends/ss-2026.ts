/**
 * SS 2026 春夏季 時尚週策展趨勢資料
 * 來源：Vogue / Elle / Harper's BAZAAR / 米蘭、巴黎、紐約、東京時裝週公開觀察
 *
 * 此檔為純靜態策展資料，不需 API 金鑰，每季手動更新即可。
 * 比 Claude 即時生成更穩定、零成本、且可控制品質。
 */

import type { Category, ClothingItem } from "@/types";

export type Trend = {
  id: string;
  name: string;
  blurb: string;
  source: string;             // 主要參考時裝週/媒體
  colors: string[];           // 4-6 個 hex
  silhouettes: string[];      // 剪裁關鍵字
  categories: Category[];     // 該趨勢的關鍵單品類別
  keywords: string[];         // 描述用關鍵字（用於匹配）
  keyPieces: string[];        // 必備單品（中文描述）
};

export const SS_2026_TRENDS: { season: string; source: string; trends: Trend[] } = {
  season: "SS 2026",
  source: "Vogue · Elle · Harper's BAZAAR · 米蘭/巴黎/紐約/東京時裝週",

  trends: [
    {
      id: "quiet-luxury",
      name: "極簡靜奢",
      blurb:
        "去 logo 化 強調剪裁與面料 The Row Khaite Toteme 持續引領這股風潮 強調以材質本身說話",
      source: "巴黎時裝週 · The Row · Khaite · Toteme",
      colors: ["#F0EEE9", "#d4c5a8", "#8b6f47", "#1F1A15", "#5c544c"],
      silhouettes: ["寬鬆直筒", "落肩剪裁", "high-waist 闊腿", "lone tailoring"],
      categories: ["jacket", "top", "bottom", "shoes"],
      keywords: ["米色", "卡其", "奶白", "墨色", "乾淨", "oversized", "極簡", "cashmere", "wool"],
      keyPieces: ["落肩西裝外套", "高腰直筒褲", "羊絨針織", "極簡平底鞋", "純色襯衫"],
    },
    {
      id: "earth-tones",
      name: "大地色調",
      blurb:
        "陶土 焦糖 橄欖 摩卡組成的色系延續強勢勢頭 一整套同色系穿搭是今季最時髦的選擇",
      source: "Vogue 春夏趨勢報導 · Fendi · Bottega Veneta",
      colors: ["#B25A36", "#8b6f47", "#6b4f3a", "#3a2a1c", "#a85f3e", "#d4c5a8"],
      silhouettes: ["同色系疊穿", "tonal layering", "natural drape"],
      categories: ["jacket", "top", "bottom", "bag", "shoes"],
      keywords: ["陶土", "焦糖", "咖啡", "棕色", "卡其", "卡其色", "麂皮", "leather", "suede"],
      keyPieces: ["麂皮外套", "焦糖色寬褲", "陶土針織", "棕色皮鞋", "皮質肩包"],
    },
    {
      id: "soft-tailoring",
      name: "柔軟西裝",
      blurb:
        "去年硬挺結構西裝今季變得柔軟流動 強調舒適感與廓形 適合上班也適合派對",
      source: "米蘭時裝週 · Max Mara · Jil Sander",
      colors: ["#1a1f2b", "#3a4f6b", "#F0EEE9", "#5c544c", "#8b6f47"],
      silhouettes: ["落肩外套", "wide leg", "雙排扣", "柔軟廓形"],
      categories: ["jacket", "bottom", "shirt"],
      keywords: ["西裝", "tailoring", "藏青", "深灰", "墨色", "linen", "lyocell"],
      keyPieces: ["落肩雙排扣西裝", "闊腿西裝褲", "絲質襯衫", "黑色腰帶"],
    },
    {
      id: "burgundy-revival",
      name: "酒紅復興",
      blurb:
        "深酒紅 葡萄紫 莓紅成為這季最強勢的點綴色 用於配件或單一單品最有時髦感",
      source: "Vogue · ELLE 春夏色報 · Saint Laurent · Prada",
      colors: ["#5b1a2e", "#7a1f3a", "#a85b50", "#1F1A15", "#B25A36"],
      silhouettes: ["accent piece", "點綴單品", "monochrome with accent"],
      categories: ["bag", "shoes", "jacket", "accessory"],
      keywords: ["酒紅", "莓紅", "葡萄紫", "burgundy", "紅"],
      keyPieces: ["酒紅皮包", "莓紅色羊毛上衣", "酒紅高跟鞋", "burgundy 圍巾"],
    },
    {
      id: "retro-sport",
      name: "復古運動",
      blurb:
        "90s 賽車外套 復古運動衫 撞色排線 把運動服變成日常街頭主角",
      source: "紐約時裝週 · Coach · Tommy Hilfiger · 街頭觀察",
      colors: ["#F0EEE9", "#3a4f6b", "#B25A36", "#1F1A15", "#86efac"],
      silhouettes: ["bomber", "track jacket", "撞色panel"],
      categories: ["jacket", "top", "shoes", "bottom"],
      keywords: ["運動", "sporty", "racing", "stripe", "bomber", "track"],
      keyPieces: ["賽車外套", "復古運動衫", "白色 chunky 球鞋", "撞色 track pants"],
    },
    {
      id: "boho-romance",
      name: "波西米亞復興",
      blurb:
        "蕾絲 流蘇 刺繡細節重回伸展台 適合在白底簡單單品上加一件當亮點",
      source: "Chloé · Etro · 波西米亞春夏專題",
      colors: ["#F0EEE9", "#d4b0c0", "#8b6f47", "#B25A36", "#fde68a"],
      silhouettes: ["A line", "flowing", "ruffle", "fringe"],
      categories: ["top", "skirt", "accessory", "bag"],
      keywords: ["蕾絲", "流蘇", "印花", "drape", "lace", "embroidery"],
      keyPieces: ["蕾絲上衣", "流蘇皮包", "印花長裙", "刺繡披肩"],
    },
    {
      id: "mono-soft-pastel",
      name: "柔軟粉彩",
      blurb:
        "粉藕 薄荷綠 嬰兒藍等柔軟粉色重新登場 重點是 monochrome 全身單一色系",
      source: "東京時裝週 · 紐約時裝週 · Gucci",
      colors: ["#d4b0c0", "#86efac", "#6db4d0", "#fde68a", "#F0EEE9"],
      silhouettes: ["monochrome", "soft drape", "co-ord set"],
      categories: ["top", "skirt", "bottom", "shoes"],
      keywords: ["粉色", "薄荷", "藍色", "嬰兒藍", "pastel", "soft"],
      keyPieces: ["粉藕針織", "薄荷綠半身裙", "藍色襯衫"],
    },
    {
      id: "denim-renewal",
      name: "丹寧革新",
      blurb:
        "丹寧今季強勢回歸 從超寬版到撕邊處理 從淺洗到黑色 都是時尚週主角",
      source: "Diesel · Y Project · GAP",
      colors: ["#3a4f6b", "#1a1f2b", "#1F1A15", "#5c544c", "#F0EEE9"],
      silhouettes: ["barrel leg", "low rise", "destroyed", "wide leg"],
      categories: ["bottom", "jacket", "shirt"],
      keywords: ["denim", "丹寧", "牛仔", "jean", "藍色", "destroyed"],
      keyPieces: ["寬版深色牛仔", "超大丹寧外套", "白丹寧襯衫"],
    },
  ],
};

// ============================ 工具函式 ============================

/**
 * 把 hex 轉成 HSL 用於顏色相似度比對
 */
function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hh = 0;
  let ss = 0;
  const ll = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    ss = ll > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hh = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        hh = ((b - r) / d + 2) / 6;
        break;
      case b:
        hh = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [hh * 360, ss, ll];
}

function colorSimilarity(hexA: string, hexB: string): number {
  // 在 HSL 空間比對：色相差不超過 30 度算近 + 明度差 < 0.25
  const [hA, sA, lA] = hexToHsl(hexA);
  const [hB, sB, lB] = hexToHsl(hexB);
  const hueDiff = Math.min(Math.abs(hA - hB), 360 - Math.abs(hA - hB));
  const satDiff = Math.abs(sA - sB);
  const lightDiff = Math.abs(lA - lB);
  // 中性色（飽和度都很低）只比明度
  if (sA < 0.2 && sB < 0.2) {
    return Math.max(0, 1 - lightDiff * 2);
  }
  return Math.max(0, 1 - (hueDiff / 180) * 0.5 - satDiff * 0.3 - lightDiff * 0.4);
}

export type TrendMatch = {
  trend: Trend;
  score: number;
  reasons: string[];
};

/**
 * 把單一單品匹配到 0-3 個最相關的 SS 2026 趨勢
 */
export function matchTrends(item: {
  category?: string | null;
  color_hex?: string | null;
  material?: string | null;
  ai_tags?: { description?: string; style_tags?: string[] } | null;
}): TrendMatch[] {
  const matches: TrendMatch[] = [];

  for (const trend of SS_2026_TRENDS.trends) {
    let score = 0;
    const reasons: string[] = [];

    // 1. 顏色匹配（最高權重）
    if (item.color_hex) {
      let bestColorScore = 0;
      for (const tc of trend.colors) {
        const sim = colorSimilarity(item.color_hex, tc);
        if (sim > bestColorScore) bestColorScore = sim;
      }
      if (bestColorScore > 0.7) {
        score += bestColorScore * 50;
        reasons.push(`顏色屬於本趨勢主打色系`);
      }
    }

    // 2. 品類匹配
    if (item.category && trend.categories.includes(item.category as Category)) {
      score += 25;
      reasons.push(`品類正好是本趨勢的關鍵單品類別`);
    }

    // 3. 關鍵字匹配（材質 / AI description / style tags）
    const text = [
      item.material ?? "",
      item.ai_tags?.description ?? "",
      ...(item.ai_tags?.style_tags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    const matchedKeywords: string[] = [];
    for (const kw of trend.keywords) {
      if (text.includes(kw.toLowerCase())) matchedKeywords.push(kw);
    }
    if (matchedKeywords.length > 0) {
      score += matchedKeywords.length * 10;
      reasons.push(`關鍵字呼應 ${matchedKeywords.join("、")}`);
    }

    if (score >= 25) {
      matches.push({ trend, score, reasons });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3);
}

// ============================ 搭配規則式分析 ============================

export type OutfitInsight = {
  type: "color" | "layer" | "trend" | "occasion" | "season";
  title: string;
  desc: string;
};

/**
 * 分析一組搭配，給出規則式推薦原因（不需 AI）
 */
export function analyzeOutfit(
  items: ClothingItem[],
  occasion?: string | null
): OutfitInsight[] {
  const insights: OutfitInsight[] = [];

  // 顏色和諧度
  const validHex = items.map((i) => i.color_hex).filter((c): c is string => !!c);
  if (validHex.length >= 2) {
    const hsls = validHex.map(hexToHsl);
    const sats = hsls.map((h) => h[1]);
    const lights = hsls.map((h) => h[2]);
    const allLowSat = sats.every((s) => s < 0.3);
    const allDark = lights.every((l) => l < 0.35);
    const allLight = lights.every((l) => l > 0.65);

    if (allLowSat) {
      insights.push({
        type: "color",
        title: "色彩內斂協調",
        desc: "整套以中性色為主 沒有突兀的高飽和點 整體看起來高級而沉穩",
      });
    } else if (allDark) {
      insights.push({
        type: "color",
        title: "深色全身搭配",
        desc: "全套深色 顯瘦俐落 適合晚間或正式場合",
      });
    } else if (allLight) {
      insights.push({
        type: "color",
        title: "明亮通透感",
        desc: "全套淺色 帶來夏季清爽通透感 適合度假或日間活動",
      });
    } else {
      // 檢查是否大地色系
      const isEarth = hsls.every(([h, s]) => (h < 50 || h > 330) && s < 0.6);
      if (isEarth) {
        insights.push({
          type: "color",
          title: "大地色系協調",
          desc: "陶土 卡其 棕色彼此呼應 是 SS 2026 主打的同色系穿搭手法",
        });
      }
    }
  }

  // 層次完整度
  const cats = new Set(items.map((i) => i.category));
  const layers: string[] = [];
  if (cats.has("jacket")) layers.push("外套");
  if (cats.has("top") || cats.has("shirt")) layers.push("內搭");
  if (cats.has("bottom") || cats.has("skirt")) layers.push("下身");
  if (cats.has("shoes")) layers.push("鞋");
  if (layers.length >= 3) {
    insights.push({
      type: "layer",
      title: "層次完整",
      desc: `包含 ${layers.join(" + ")} 整套搭配結構完整 不會顯得單薄`,
    });
  } else if (layers.length === 2) {
    insights.push({
      type: "layer",
      title: "簡潔兩件式",
      desc: "兩件式的簡單組合 適合溫暖天氣或慵懶造型",
    });
  }

  // 趨勢匹配
  const trendMatches = new Map<string, { trend: Trend; count: number }>();
  for (const it of items) {
    const matches = matchTrends({
      category: it.category,
      color_hex: it.color_hex,
      material: it.material,
      ai_tags: it.ai_tags as { description?: string; style_tags?: string[] } | null,
    });
    for (const m of matches) {
      const cur = trendMatches.get(m.trend.id);
      if (cur) cur.count++;
      else trendMatches.set(m.trend.id, { trend: m.trend, count: 1 });
    }
  }
  const sortedTrends = Array.from(trendMatches.values()).sort((a, b) => b.count - a.count);
  if (sortedTrends.length > 0 && sortedTrends[0].count >= 2) {
    const top = sortedTrends[0].trend;
    insights.push({
      type: "trend",
      title: `呼應「${top.name}」趨勢`,
      desc: `整套搭配契合 SS 2026 ${top.name} ${top.blurb}`,
    });
  }

  // 場合適配
  if (occasion) {
    const occasionMatch: Record<string, { categories: Category[]; desc: string }> = {
      上班: { categories: ["jacket", "shirt", "bottom", "shoes"], desc: "層次完整 適合辦公室場合" },
      約會: { categories: ["top", "skirt"], desc: "輕鬆且有亮點 適合約會穿搭" },
      派對: { categories: ["accessory", "shoes"], desc: "有亮點配件 適合派對場合" },
      運動: { categories: ["top", "bottom", "shoes"], desc: "舒適剪裁 適合運動或休閒" },
      日常: { categories: ["top", "bottom", "shoes"], desc: "舒適耐看 適合日常通勤休閒" },
      正式場合: { categories: ["jacket", "shirt", "shoes"], desc: "完整且正式 適合重要場合" },
    };
    const om = occasionMatch[occasion];
    if (om && om.categories.some((c) => cats.has(c))) {
      insights.push({
        type: "occasion",
        title: `符合「${occasion}」場合`,
        desc: om.desc,
      });
    }
  }

  // 季節一致性
  const seasonCounts: Record<string, number> = {};
  for (const it of items) {
    for (const s of it.season ?? []) {
      seasonCounts[s] = (seasonCounts[s] ?? 0) + 1;
    }
  }
  const dominantSeason = Object.entries(seasonCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominantSeason && dominantSeason[1] >= items.length - 1) {
    const seasonZh: Record<string, string> = { spring: "春", summer: "夏", fall: "秋", winter: "冬" };
    insights.push({
      type: "season",
      title: `${seasonZh[dominantSeason[0]] ?? dominantSeason[0]}季穿搭`,
      desc: "單品季節一致 整套適合同一個季節穿著",
    });
  }

  return insights;
}
