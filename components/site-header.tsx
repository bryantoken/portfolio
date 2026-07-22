import Link from "next/link";
import Image from "next/image";
import type { Session } from "next-auth";
import { IconScroll, IconTower, IconShield } from "@/components/icons";

export function SiteHeader({ session }: { session: Session | null }) {
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4 md:px-8 md:py-6 lg:max-w-6xl">
      <Link href="/" className="flex items-center" aria-label="bryantoken — início">
        <Image
          src="/brand/wordmark.png"
          alt="bryantoken"
          width={320}
          height={65}
          priority
          className="h-11 w-auto md:h-14"
        />
      </Link>

      <nav className="hidden items-center gap-6 font-sans text-[13px] text-fg-soft md:flex">
        <Link href="/garden" className="inline-flex items-center gap-1.5 transition hover:text-fg">
          <IconScroll size={16} /> Jardim
        </Link>
        <Link href="/about" className="inline-flex items-center gap-1.5 transition hover:text-fg">
          <IconTower size={16} /> Sobre
        </Link>
        {isAdmin && (
          <Link href="/admin" className="text-rosewood-soft transition hover:text-rosewood">
            Admin
          </Link>
        )}
        {session?.user ? (
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 transition hover:border-rosewood/50 hover:text-fg"
          >
            <IconShield size={15} /> {session.user.username ?? "perfil"}
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-border bg-surface px-3.5 py-1.5 transition hover:border-rosewood/50 hover:text-fg"
          >
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
