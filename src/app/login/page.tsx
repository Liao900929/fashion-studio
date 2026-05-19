"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="min-h-screen flex">
      {/* Left: hero image area — Cloud Dancer 底 + Deep Espresso 細紋 */}
      <div
        className="hidden md:flex flex-1 relative overflow-hidden"
        style={{
          background: "var(--bg)",
          borderRight: "1px solid var(--line)",
        }}
      >
        {/* Burnt Sienna 細線描繪 F 字框 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            width="60%"
            height="60%"
            viewBox="0 0 200 240"
            style={{ opacity: 0.18 }}
            aria-hidden
          >
            <path
              d="M 50 30 L 50 210 M 50 30 L 150 30 M 50 110 L 130 110"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col justify-end p-12 w-full">
          <p className="eyebrow mb-3">SS 2026 · Editorial</p>
          <h2
            className="text-4xl md:text-5xl mb-3 serif"
            style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}
          >
            屬於你的<br/>
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
              私人衣櫥檔案
            </span>
          </h2>
          <p style={{ color: "var(--fg-dim)", maxWidth: "28rem" }}>
            從拍下的第一件單品開始 建立有靈魂的搭配資料庫
          </p>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-4">FASHION STUDIO</p>
          <h1 className="text-3xl md:text-4xl mb-3 serif">登入你的衣櫥</h1>
          <p className="text-sm mb-10" style={{ color: "var(--fg-dim)" }}>
            使用 Google 帳號一鍵登入，立即開始建立你的個人搭配空間。
          </p>

          <button
            onClick={signIn}
            disabled={loading}
            className="btn-google"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <GoogleIcon />
            {loading ? "登入中..." : "Continue with Google"}
          </button>

          <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--line)" }}>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              登入即表示同意我們的服務條款與隱私政策。<br/>
              你的衣物資料僅你本人可以看到。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
