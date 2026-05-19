"use client";

import { useEffect, useRef, ReactNode, CSSProperties } from "react";

type Props = {
  children: ReactNode;
  delay?: number;            // seconds
  className?: string;
  style?: CSSProperties;
  threshold?: number;        // 0-1
};

export default function MaskReveal({
  children,
  delay = 0,
  className = "",
  style,
  threshold = 0.4,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add("in-view"), delay * 1000);
            io.unobserve(el);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, threshold]);

  return (
    <span ref={ref} className={`mask-reveal ${className}`} style={style}>
      <span className="mask-text">{children}</span>
    </span>
  );
}
