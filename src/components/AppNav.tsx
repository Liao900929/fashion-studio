"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const links = [
  { href: "/wardrobe", label: "Wardrobe", zh: "衣櫥" },
  { href: "/outfits", label: "Outfits", zh: "搭配" },
  { href: "/inspire", label: "Inspire", zh: "靈感" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-5" style={{ borderBottom: "1px solid var(--line)" }}>
      <Link href="/wardrobe" className="serif text-lg" style={{ letterSpacing: "0.1em" }}>
        FASHION · STUDIO
      </Link>
      <div className="flex items-center gap-8">
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs uppercase tracking-widest transition-colors"
              style={{
                color: active ? "var(--accent)" : "var(--fg-dim)",
                borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
                paddingBottom: "0.2rem",
              }}
            >
              {l.label}
            </Link>
          );
        })}
        <button
          onClick={signOut}
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--fg-muted)" }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
