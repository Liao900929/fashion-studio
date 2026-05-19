import OpenAI from 'openai'

let _client: OpenAI | null = null

function getClient() {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

export type ClothingAnalysis = {
  category: 'hat' | 'top' | 'bottom' | 'skirt' | 'shoes' | 'jacket' | 'shirt' | 'accessory' | 'bag' | 'other'
  material: string
  color_hex: string
  color_name: string
  palette: string[]
  season: ('spring' | 'summer' | 'fall' | 'winter')[]
  description: string
  style_tags: string[]
}

const SYSTEM_PROMPT = `You analyze clothing photos. Return ONLY valid JSON matching this schema:
{
  "category": one of hat|top|bottom|skirt|shoes|jacket|shirt|accessory|bag|other,
  "material": short string (e.g., "cotton", "denim", "leather", "wool knit"),
  "color_hex": dominant color hex like "#3b2a1c",
  "color_name": Traditional Chinese color name (e.g., "卡其色", "藏青色"),
  "palette": array of 3-5 hex colors representing the item's palette,
  "season": array of seasons it suits, from ["spring","summer","fall","winter"],
  "description": short Traditional Chinese description (under 30 chars),
  "style_tags": 2-4 style descriptors in Traditional Chinese (e.g., ["極簡","街頭"])
}
No prose, no markdown — JSON only.`

export async function analyzeClothingImage(imageUrl: string): Promise<ClothingAnalysis> {
  const client = getClient()
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this clothing item.' },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  return JSON.parse(raw) as ClothingAnalysis
}
