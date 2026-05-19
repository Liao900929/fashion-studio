import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CustomCursor from "@/components/CustomCursor";
import SplitText from "@/components/SplitText";
import MagneticButton from "@/components/MagneticButton";
import MaskReveal from "@/components/MaskReveal";

export default async function HomePage() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/wardrobe");
  } catch {
    // Placeholder env or network unavailable — show landing
  }

  return (
    <main className="landing-theme min-h-screen relative">
      <CustomCursor />

      {/* Nav */}
      <nav className="px-8 md:px-14 py-7 flex items-center justify-between relative z-30">
        <Link href="/" className="flex items-center gap-2 magnet" data-cursor="hover">
          <span className="text-2xl" style={{ color: "var(--accent)" }}>✦</span>
          <span className="text-sm tracking-[0.4em] uppercase font-medium">Atelier</span>
        </Link>
        <Link href="/login" className="btn-line magnet" data-cursor="hover">
          Sign In <span style={{ color: "var(--accent)" }}>→</span>
        </Link>
      </nav>

      {/* HERO */}
      <section className="px-8 md:px-14 pt-10 md:pt-20 pb-16 relative">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
          {/* Left column — typography */}
          <div className="col-span-12 md:col-span-7 relative">
            <div className="flex items-center gap-3 mb-8 reveal" style={{ animationDelay: "0.05s" }}>
              <span className="block w-12 h-px" style={{ background: "var(--accent)" }} />
              <span className="text-xs tracking-[0.4em] uppercase" style={{ color: "var(--accent)" }}>
                SS &apos;26 &nbsp;·&nbsp; Vol 01
              </span>
            </div>

            <h1
              className="font-medium"
              style={{
                fontSize: "clamp(3.5rem, 10vw, 9.5rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.05em",
                fontFamily: "var(--font-sans)",
              }}
            >
              <SplitText as="span" text="風格" className="block" delay={0.1} stagger={0.06} />
              <SplitText
                as="span"
                text="是對生活"
                className="block"
                delay={0.4}
                stagger={0.05}
              />
              <SplitText
                as="span"
                text="的態度"
                className="block italic"
                style={{ color: "var(--accent)", fontWeight: 300 }}
                delay={0.7}
                stagger={0.06}
              />
            </h1>

            <div
              className="mt-12 flex items-center gap-6 reveal"
              style={{ animationDelay: "1.6s" }}
            >
              <MagneticButton href="/login">
                Enter the Atelier
                <span>→</span>
              </MagneticButton>
              <a href="#editor-note" className="btn-line magnet" data-cursor="hover">
                The Edit
              </a>
            </div>

            {/* Footnote */}
            <div className="mt-20 max-w-sm reveal" style={{ animationDelay: "1.9s" }}>
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--fg-muted)" }}>
                Curated · Private · Considered
              </p>
              <div className="w-16 h-px" style={{ background: "var(--line)" }} />
            </div>
          </div>

          {/* Right column — lookbook image collage */}
          <div className="col-span-12 md:col-span-5 relative" style={{ minHeight: "70vh" }}>
            {/* Vertical rail label */}
            <div className="hidden md:block absolute -left-8 top-8 rail-text">
              The Wardrobe Issue
            </div>

            {/* Tile 1 - tall */}
            <div
              className="lookbook-tile absolute reveal"
              data-label="01 · Outerwear"
              style={{
                top: 0,
                right: "10%",
                width: "60%",
                aspectRatio: "3 / 4",
                animationDelay: "0.5s",
              }}
            >
              <PlaceholderArt variant={1} />
            </div>

            {/* Tile 2 - mid offset */}
            <div
              className="lookbook-tile absolute reveal"
              data-label="02 · Knitwear"
              style={{
                top: "40%",
                left: 0,
                width: "48%",
                aspectRatio: "1 / 1",
                animationDelay: "0.8s",
              }}
            >
              <PlaceholderArt variant={2} />
            </div>

            {/* Tile 3 - bottom right small */}
            <div
              className="lookbook-tile absolute reveal"
              data-label="03 · Accessories"
              style={{
                bottom: 0,
                right: 0,
                width: "42%",
                aspectRatio: "4 / 5",
                animationDelay: "1.1s",
              }}
            >
              <PlaceholderArt variant={3} />
            </div>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="mt-24 md:mt-0 md:absolute md:bottom-10 md:left-1/2 md:-translate-x-1/2 text-center">
          <div className="scroll-indicator">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: "var(--fg-muted)" }}>
              Scroll
            </p>
            <span className="block mx-auto w-px h-12" style={{ background: "var(--fg-muted)" }} />
          </div>
        </div>
      </section>

      {/* MARQUEE separator */}
      <div
        className="py-4 overflow-hidden whitespace-nowrap"
        style={{
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          background: "var(--bg-elev)",
        }}
      >
        <div className="marquee">
          {Array.from({ length: 2 }).flatMap(() => MARQUEE).map((w, i) => (
            <span
              key={i}
              className="px-6"
              style={{
                fontSize: "0.75rem",
                color: i % 3 === 0 ? "var(--accent)" : "var(--fg-dim)",
                fontStyle: i % 3 === 0 ? "italic" : "normal",
                fontWeight: 400,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              {w} <span style={{ color: "var(--accent-soft)", margin: "0 0.5rem" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Editorial Quote + CTA — fashion brand style */}
      <section id="editor-note" className="px-8 md:px-14 py-32 md:py-40 max-w-4xl mx-auto text-center">
        <p className="text-xs tracking-[0.4em] uppercase mb-8" style={{ color: "var(--accent)" }}>
          Editor&apos;s Note
        </p>
        <div
          style={{
            fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
            lineHeight: 1.6,
            letterSpacing: "-0.01em",
            fontWeight: 300,
            color: "var(--fg)",
          }}
        >
          <div className="mb-2">
            <MaskReveal delay={0}>像翻一本季刊一樣</MaskReveal>{" "}
            <MaskReveal delay={0.5}>
              <span className="accent-word" style={{ fontStyle: "italic", color: "var(--accent)" }}>
                慢慢來
              </span>
            </MaskReveal>
          </div>
          <div className="mb-2">
            <MaskReveal delay={1.0}>先拍一件喜歡的</MaskReveal>
          </div>
          <div>
            <MaskReveal delay={1.5}>剩下的</MaskReveal>{" "}
            <MaskReveal delay={1.9}>
              <span className="accent-word" style={{ fontStyle: "italic", color: "var(--accent)" }}>
                交給時間
              </span>
            </MaskReveal>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-6">
          <p
            style={{
              fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
              letterSpacing: "-0.01em",
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--fg-dim)",
            }}
          >
            <span style={{ color: "var(--accent)" }}>—</span> 準備好整理你的衣櫥了嗎？
          </p>
          <MagneticButton href="/login">
            Begin
            <span>→</span>
          </MagneticButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-14 py-10" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p
              className="serif italic mb-1"
              style={{ fontSize: "2rem", color: "var(--accent)", letterSpacing: "-0.02em" }}
            >
              ✦ Atelier
            </p>
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--fg-muted)" }}>
              A private wardrobe &nbsp;—&nbsp; considered
            </p>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--fg-muted)" }}>
            © 2026 · Made with care
          </p>
        </div>
      </footer>
    </main>
  );
}

/* Placeholder art — 嚴格使用 3 色系統（Cloud Dancer + Deep Espresso + Burnt Sienna） */
function PlaceholderArt({ variant }: { variant: 1 | 2 | 3 }) {
  // 每個 variant 用 Deep Espresso 不同透明度製造視覺差異
  // 不引入新色，accent 點綴用 Burnt Sienna
  const washes: Record<number, number> = { 1: 0.04, 2: 0.07, 3: 0.05 };
  const wash = washes[variant];

  return (
    <svg
      viewBox="0 0 200 250"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: "block" }}
    >
      {/* Cloud Dancer 底色 */}
      <rect width="200" height="250" fill="#F0EEE9" />
      {/* Deep Espresso 透明度淡洗 */}
      <rect width="200" height="250" fill="#1F1A15" opacity={wash} />
      {/* 服裝剪影 — 深可可墨 */}
      <g fill="#1F1A15" opacity="0.13">
        {variant === 1 && (
          <path d="M70,40 L130,40 L155,90 L150,210 L50,210 L45,90 Z" />
        )}
        {variant === 2 && (
          <circle cx="100" cy="125" r="55" />
        )}
        {variant === 3 && (
          <path d="M60,80 L140,80 L150,180 L130,210 L70,210 L50,180 Z" />
        )}
      </g>
      {/* 焙焦赭土小點綴（Burnt Sienna 標記） */}
      <circle cx="180" cy="20" r="3" fill="#B25A36" opacity="0.6" />
      {/* Look label */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-serif)"
        fontStyle="italic"
        fontSize="14"
        fill="#1F1A15"
        opacity="0.4"
      >
        Look 0{variant}
      </text>
    </svg>
  );
}

const MARQUEE = [
  "Atelier",
  "Slow Wardrobe",
  "Be Yourself",
  "Considered Style",
  "Daily Edit",
  "Wear With Care",
];

