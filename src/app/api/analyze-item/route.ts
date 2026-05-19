import { NextResponse } from 'next/server'
import { analyzeClothingImage } from '@/lib/ai/openai'
import { createSupabaseServer } from '@/lib/supabase/server'
import { isOpenAIEnabled } from '@/lib/ai/config'

export async function POST(request: Request) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  if (!isOpenAIEnabled) {
    return NextResponse.json({ disabled: true, message: '尚未設定 OpenAI 金鑰 請手動填寫單品資訊' })
  }

  const { imageUrl } = await request.json()
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })

  try {
    const analysis = await analyzeClothingImage(imageUrl)
    return NextResponse.json(analysis)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'analysis failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
