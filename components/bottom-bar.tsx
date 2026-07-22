"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import {
  IconKey,
  IconScroll,
  IconLoupe,
  IconSeal,
  IconShield,
} from "@/components/icons";

type Item = {
  href: string;
  label: string;
  icon: (p: { size?: number }) => React.ReactNode;
  match: (path: string) => boolean;
};

export function BottomBar({ session }: { session: Session | null }) {
  const pathname = usePathname() || "/";

  const items: Item[] = [
    { href: "/", label: "Início", icon: IconKey, match: (p) => p === "/" },
    {
      href: "/garden",
      label: "Jardim",
      icon: IconScroll,
      match: (p) => p.startsWith("/garden") || p.startsWith("/notes"),
    },
    {
      href: "/search",
      label: "Buscar",
      icon: IconLoupe,
      match: (p) => p.startsWith("/search"),
    },
    {
      href: "/saved",
      label: "Salvos",
      icon: IconSeal,
      match: (p) => p.startsWith("/saved"),
    },
    {
      href: session?.user ? "/profile" : "/login",
      label: session?.user ? "Perfil" : "Entrar",
      icon: IconShield,
      match: (p) => p.startsWith("/profile") || p.startsWith("/login"),
    },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] md:hidden"
    >
      <div className="flex w-full max-w-md items-stretch justify-between gap-1 rounded-2xl border border-border/80 bg-surface/80 p-1.5 shadow-float backdrop-blur-xl">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium tracking-wide transition-colors ${
                active
                  ? "text-rosewood"
                  : "text-fg-muted hover:text-fg-soft"
              }`}
            >
              {active && (
                <span className="absolute inset-0 -z-10 rounded-xl bg-rosewood/10 ring-1 ring-rosewood/25" />
              )}
              <Icon size={22} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
