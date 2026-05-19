import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif-loaded",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-loaded",
});

const notoTc = Noto_Sans_TC({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-tc-loaded",
});

export const metadata: Metadata = {
  title: "Fashion Studio — 我的衣櫥",
  description: "個人化服裝搭配空間：AI 分類、3D 展示、時尚週靈感",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-TW"
      className={`${playfair.variable} ${inter.variable} ${notoTc.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
