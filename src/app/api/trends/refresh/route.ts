import { NextResponse } from 'next/server'
import { generateSeasonalTrends } from '@/lib/ai/claude'
import { createSupabaseServer } from '@/lib/supabase/server'
import { isClaudeEnabled } from '@/lib/ai/config'

export async function POST(request: Request) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  if (!isClaudeEnabled) {
    return NextResponse.json({ disabled: true, message: '趨勢生成需要 Anthropic 金鑰' })
  }

  const { seasonKey } = await request.json().catch(() => ({}))
  const key = seasonKey || currentSeasonKey()

  try {
    const trends = await generateSeasonalTrends(key)
    const { data, error } = await supabase
      .from('trend_cache')
      .upsert(
        {
          season_key: key,
          source: 'claude-generated',
          trends,
          refreshed_at: new Date().toISOString(),
        },
        { onConflict: 'season_key' }
      )
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'refresh failed'
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
