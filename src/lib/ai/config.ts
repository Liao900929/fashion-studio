/**
 * 判斷 AI 功能是否啟用（金鑰是否真的存在且非占位符）。
 * 沒金鑰也能跑 — 只是 AI 自動分析 / 評語 / 趨勢功能會自動 fallback 到手動模式。
 */
export const isOpenAIEnabled =
  !!process.env.OPENAI_API_KEY &&
  !process.env.OPENAI_API_KEY.includes('placeholder') &&
  process.env.OPENAI_API_KEY.length > 20

export const isClaudeEnabled =
  !!process.env.ANTHROPIC_API_KEY &&
  !process.env.ANTHROPIC_API_KEY.includes('placeholder') &&
  process.env.ANTHROPIC_API_KEY.length > 20
