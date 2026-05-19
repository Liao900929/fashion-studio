"use client";

import { CSSProperties } from "react";

type Props = {
  text: string;
  delay?: number;        // base delay in seconds
  stagger?: number;      // delay between chars
  className?: string;
  style?: CSSProperties;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
};

export default function SplitText({
  text,
  delay = 0,
  stagger = 0.04,
  className,
  style,
  as = "span",
}: Props) {
  const Tag = as;
  const chars = Array.from(text);

  return (
    <Tag className={className} style={style} aria-label={text}>
      {chars.map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="split-char"
          style={{
            animationDelay: `${delay + i * stagger}s`,
            // Preserve spaces
            whiteSpace: ch === " " ? "pre" : undefined,
          }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </Tag>
  );
}
