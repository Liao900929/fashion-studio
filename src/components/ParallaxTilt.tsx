"use client";

import { ReactNode, useRef, MouseEvent, TouchEvent, CSSProperties } from "react";

type Props = {
  children: ReactNode;
  /** 最大傾斜角度（度） */
  maxTilt?: number;
  /** 光澤強度 0~1 */
  glare?: number;
  /** 透視距離 */
  perspective?: number;
  /** 縮放係數（hover 時） */
  scale?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * 視差傾斜效果 — 滑鼠/觸控滑過時整個元素跟著轉，
 * 模擬一張平面照片變成有深度的「半 3D」感。
 *
 * 沒用任何 3D 模型，純 CSS transform + 滑鼠位置數學。
 */
export default function ParallaxTilt({
  children,
  maxTilt = 12,
  glare = 0.35,
  perspective = 1000,
  scale = 1.03,
  className = "",
  style,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  function update(clientX: number, clientY: number) {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    const g = glareRef.current;
    if (!wrap || !inner) return;

    const rect = wrap.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width; // 0~1
    const y = (clientY - rect.top) / rect.height;

    const tiltX = (0.5 - y) * 2 * maxTilt;  // 上負下正 → 滑上 = 往後仰
    const tiltY = (x - 0.5) * 2 * maxTilt;  // 左負右正 → 滑右 = 右邊往前

    inner.style.transform = `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;

    // 光澤跟著滑鼠位置走
    if (g && glare > 0) {
      const gx = x * 100;
      const gy = y * 100;
      g.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,${glare}) 0%, rgba(255,255,255,0) 50%)`;
      g.style.opacity = "1";
    }
  }

  function reset() {
    const inner = innerRef.current;
    const g = glareRef.current;
    if (inner) {
      inner.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    }
    if (g) g.style.opacity = "0";
  }

  function onMouseMove(e: MouseEvent) {
    update(e.clientX, e.clientY);
  }
  function onTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) update(e.touches[0].clientX, e.touches[0].clientY);
  }

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ ...style, perspective: `${perspective}px` }}
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
      onTouchMove={onTouchMove}
      onTouchEnd={reset}
    >
      <div
        ref={innerRef}
        style={{
          width: "100%",
          height: "100%",
          transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
          willChange: "transform",
          position: "relative",
        }}
      >
        {children}
        {/* 光澤層 */}
        <div
          ref={glareRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.3s",
            mixBlendMode: "overlay",
          }}
        />
      </div>
    </div>
  );
}
