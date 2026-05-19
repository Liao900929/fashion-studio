"use client";

import { useState, useRef } from "react";

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

  return (
    <div className="select-none">
      <div
        className="relative w-full overflow-hidden card"
        style={{ aspectRatio: "1", cursor: total > 1 ? "ew-resize" : "default", padding: 0 }}
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
        {total > 1 && (
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
        )}
        {total > 1 && (
          <span
            className="absolute top-3 right-3 text-xs uppercase tracking-widest px-2 py-1"
            style={{ background: "rgba(31,26,21,0.75)", color: "#F0EEE9" }}
          >
            ← 拖曳旋轉 → · {idx + 1}/{total}
          </span>
        )}
      </div>
    </div>
  );
}
