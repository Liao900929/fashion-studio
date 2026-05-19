export type Category =
  | 'hat' | 'top' | 'bottom' | 'skirt' | 'shoes'
  | 'jacket' | 'shirt' | 'accessory' | 'bag' | 'other'

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

export const CATEGORY_LABELS: Record<Category, { zh: string; emoji: string }> = {
  hat: { zh: '帽子', emoji: '🧢' },
  top: { zh: '上衣', emoji: '👕' },
  bottom: { zh: '褲裝', emoji: '👖' },
  skirt: { zh: '裙裝', emoji: '👗' },
  shoes: { zh: '鞋類', emoji: '👟' },
  jacket: { zh: '外套', emoji: '🧥' },
  shirt: { zh: '襯衫', emoji: '👔' },
  accessory: { zh: '配件', emoji: '⌚' },
  bag: { zh: '包款', emoji: '👜' },
  other: { zh: '其他', emoji: '✨' },
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: '春', summer: '夏', fall: '秋', winter: '冬',
}

export interface Brand {
  id: string
  user_id: string | null
  name: string
  logo_url: string | null
}

export interface ClothingItem {
  id: string
  user_id: string
  primary_image_url: string
  angle_image_urls: string[]
  category: Category
  material: string | null
  brand_id: string | null
  color_hex: string | null
  color_name: string | null
  palette: string[] | null
  season: Season[]
  ai_tags: Record<string, unknown> | null
  notes: string | null
  times_worn: number
  last_worn_at: string | null
  created_at: string
  updated_at: string
  brand?: Brand | null
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  cover_image_url: string | null
  style_tags: string[]
  item_ids: string[]
  occasion: string | null
  ai_advice: string | null
  worn_at: string | null
  created_at: string
  updated_at: string
}

export interface TrendCache {
  id: string
  season_key: string
  source: string
  trends: {
    key_styles: string[]
    colors: { hex: string; name: string }[]
    silhouettes: string[]
    key_pieces: string[]
    summary: string
  }
  refreshed_at: string
}
