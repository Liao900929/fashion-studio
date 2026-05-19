"use client";

import { useState, useRef } from "react";
import ParallaxTilt from "./ParallaxTilt";

export default function Carousel360({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const startX = useRef<number | null>(null);
  const total = images.length;

  function handleStart(x: number) {
    startX.current = x;
  }
  function handleMove(x: number) {
    if (startX.current === null || total <= 1) return;
    const delta = x - startX.current;
    const threshold = 30;
    if (Math.abs(delta) > threshold) {
      const step = delta > 0 ? -1 : 1;
      setIdx((i) => (i + step + total) % total);
      startX.current = x;
    }
  }
  function handleEnd() {
    startX.current = null;
  }

  if (images.length === 0) return null;

  // 單張 → 用 ParallaxTilt 視差傾斜模擬 3D 深度
  if (total === 1) {
    return (
      <div className="select-none">
        <ParallaxTilt
          className="relative w-full overflow-hidden card"
          style={{ aspectRatio: "1", padding: 0 }}
          maxTilt={14}
          glare={0.3}
          scale={1.04}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt=""
            draggable={false}
            className="w-full h-full object-contain"
            style={{ background: "var(--bg-elev)" }}
          />
          <span
            className="absolute top-3 right-3 text-xs uppercase tracking-widest px-2 py-1"
            style={{ background: "rgba(31,26,21,0.75)", color: "#F0EEE9", letterSpacing: "0.15em" }}
          >
            ✦ 滑鼠移過可傾斜
          </span>
        </ParallaxTilt>
      </div>
    );
  }

  // 多張 → 真實環景拖曳
  return (
    <div className="select-none">
      <div
        className="relative w-full overflow-hidden card"
        style={{ aspectRatio: "1", cursor: "ew-resize", padding: 0 }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[idx]}
          alt=""
          draggable={false}
          className="w-full h-full object-contain"
          style={{ background: "var(--bg-elev)" }}
        />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === idx ? "var(--accent)" : "var(--line)" }}
            />
          ))}
        </div>
        <span
          className="absolute top-3 right-3 text-xs uppercase tracking-widest px-2 py-1"
          style={{ background: "rgba(31,26,21,0.75)", color: "#F0EEE9" }}
        >
          ← 拖曳旋轉 → · {idx + 1}/{total}
        </span>
      </div>
    </div>
  );
}
