import { NextResponse } from 'next/server'
import { getOutfitAdvice } from '@/lib/ai/claude'
import { createSupabaseServer } from '@/lib/supabase/server'
import { isClaudeEnabled } from '@/lib/ai/config'

export async function POST(request: Request) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  if (!isClaudeEnabled) {
    return NextResponse.json({ disabled: true, message: 'AI 造型評語需要 Anthropic 金鑰' })
  }

  const { itemIds, occasion } = await request.json()
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return NextResponse.json({ error: 'itemIds required' }, { status: 400 })
  }

  const { data: items } = await supabase
    .from('clothing_items')
    .select('*, brand:brands(name)')
    .in('id', itemIds)

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'items not found' }, { status: 404 })
  }

  // Pull current season trends from cache
  const seasonKey = currentSeasonKey()
  const { data: trend } = await supabase
    .from('trend_cache')
    .select('trends')
    .eq('season_key', seasonKey)
    .single()

  const trendContext = trend?.trends
    ? `當季關鍵風格：${(trend.trends.key_styles ?? []).join('、')}；主打色：${(trend.trends.colors ?? []).map((c: { name: string }) => c.name).join('、')}；必備單品：${(trend.trends.key_pieces ?? []).join('、')}。`
    : '（尚未生成當季趨勢資料）'

  try {
    const advice = await getOutfitAdvice(
      items.map((i) => ({
        category: i.category,
        material: i.material,
        color_name: i.color_name,
        brand: i.brand?.name,
        description: (i.ai_tags as { description?: string } | null)?.description,
      })),
      occasion ?? '日常',
      trendContext
    )

    return NextResponse.json({ advice, seasonKey })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'advice failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function currentSeasonKey(): string {
  const m = new Date().getMonth() + 1
  const y = new Date().getFullYear()
  if (m >= 3 && m <= 5) return `${y}-spring`
  if (m >= 6 && m <= 8) return `${y}-summer`
  if (m >= 9 && m <= 11) return `${y}-fall`
  return `${y}-winter`
}
