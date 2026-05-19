import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

const MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT_PERSONA = `你是 Yuki，一位專精時尚週與街頭穿搭的造型師。你的建議要：
- 具體（指出材質、顏色、剪裁的搭配邏輯）
- 親切但專業（用「我覺得」「試試看」這樣的口語）
- 引用當季時裝週重點（米蘭、巴黎、紐約、東京）
- 中文回答，繁體中文`

type OutfitItem = {
  category: string
  material?: string
  color_name?: string
  brand?: string
  description?: string
}

export async function getOutfitAdvice(
  items: OutfitItem[],
  occasion: string,
  trendsContext: string
): Promise<string> {
  const client = getClient()
  const itemsList = items
    .map((i, idx) => `${idx + 1}. ${i.category}｜${i.color_name ?? ''} ${i.material ?? ''}｜${i.brand ?? ''}｜${i.description ?? ''}`)
    .join('\n')

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: [
      { type: 'text', text: SYSTEM_PROMPT_PERSONA, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: `當季時尚週重點摘要：\n${trendsContext}` },
    ],
    messages: [
      {
        role: 'user',
        content: `使用者搭配了這幾件單品：\n${itemsList}\n\n適合場合：${occasion || '日常'}\n\n請給 150-200 字的造型評語：第一段稱讚做得好的地方，第二段提出 1-2 個具體改進建議或可替換的單品。`,
      },
    ],
  })

  const text = message.content.find((b) => b.type === 'text')
  return text?.type === 'text' ? text.text : ''
}

export async function generateSeasonalTrends(seasonKey: string): Promise<{
  key_styles: string[]
  colors: { hex: string; name: string }[]
  silhouettes: string[]
  key_pieces: string[]
  summary: string
}> {
  const client = getClient()
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: SYSTEM_PROMPT_PERSONA,
    messages: [
      {
        role: 'user',
        content: `根據 ${seasonKey} 時尚週（米蘭、巴黎、紐約、東京）的觀察，回傳 JSON：
{
  "key_styles": ["風格 1","風格 2",...] (5-7 個當季風格關鍵字),
  "colors": [{"hex": "#xxx", "name": "色名"}, ...] (5-8 個主打色),
  "silhouettes": ["剪裁/輪廓 1","剪裁/輪廓 2",...] (3-5 個),
  "key_pieces": ["關鍵單品 1","關鍵單品 2",...] (5-8 個必備單品),
  "summary": "整體趨勢一段話描述，100 字內"
}
只回 JSON，不要任何前後文。`,
      },
    ],
  })

  const text = message.content.find((b) => b.type === 'text')
  const raw = text?.type === 'text' ? text.text : '{}'
  return JSON.parse(raw)
}
