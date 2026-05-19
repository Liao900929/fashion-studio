"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const rot = rotRef.current;
    if (!wrap || !rot) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx, cy = my;
    let angle = 0;
    let lastX = mx, lastY = my;
    let raf = 0;

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const loop = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;

      const dx = cx - lastX;
      const dy = cy - lastY;
      const speed = Math.hypot(dx, dy);
      if (speed > 0.6) {
        const target = (Math.atan2(dy, dx) * 180) / Math.PI;
        let diff = target - angle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        angle += diff * 0.25;
      }
      lastX = cx;
      lastY = cy;

      wrap.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      rot.style.transform = `rotate(${angle}deg)`;
      raf = requestAnimationFrame(loop);
    };

    const enter = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, .magnet, [data-cursor='hover']")) {
        wrap.classList.add("hover");
      }
    };
    const leave = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, .magnet, [data-cursor='hover']")) {
        wrap.classList.remove("hover");
      }
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", enter);
    document.addEventListener("mouseout", leave);
    loop();

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", enter);
      document.removeEventListener("mouseout", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className="cursor-arrow">
      {/* Layer 1: rotation (JS-driven, faces movement) */}
      <div ref={rotRef} className="cursor-rot">
        {/* Layer 2: scale on hover (CSS) */}
        <div className="cursor-scale">
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
            <polygon points="28,16 12,22 16,16 12,10" className="cursor-poly" />
          </svg>
        </div>
      </div>
      {/* Label stays upright (outside rotation) */}
      <span className="cursor-label">CLICK</span>
    </div>
  );
}
