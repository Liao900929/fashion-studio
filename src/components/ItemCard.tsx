import Link from "next/link";
import { CATEGORY_LABELS, type ClothingItem } from "@/types";

export default function ItemCard({ item }: { item: ClothingItem }) {
  const cat = CATEGORY_LABELS[item.category];
  return (
    <Link
      href={`/wardrobe/${item.id}`}
      className="block group"
    >
      <div
        className="card overflow-hidden relative"
        style={{ borderRadius: 4 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.primary_image_url}
          alt={item.color_name ?? "clothing item"}
          className="w-full transition-transform duration-700 group-hover:scale-105"
          style={{ display: "block", aspectRatio: "auto" }}
        />
        {item.angle_image_urls?.length > 1 && (
          <span
            className="absolute top-2 right-2 text-xs px-2 py-1 rounded-sm"
            style={{ background: "rgba(31,26,21,0.75)", color: "#F0EEE9", letterSpacing: "0.1em" }}
          >
            360°
          </span>
        )}
      </div>

      <div className="pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest" style={{ color: "var(--fg-dim)" }}>
            {cat.emoji} {cat.zh}
          </span>
        </div>
        {item.color_hex && (
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: item.color_hex, border: "1px solid var(--line)" }}
            title={item.color_name ?? ""}
          />
        )}
      </div>
      <p className="text-xs serif italic" style={{ color: "var(--fg-muted)" }}>
        {item.material ?? ""} {item.color_name ?? ""}
      </p>
    </Link>
  );
}
