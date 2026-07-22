import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile-form";
import { KeyShop } from "@/components/key-shop";
import { KEY_COSTS } from "@/lib/key";
import { IconToken, IconShield, IconSeal } from "@/components/icons";

export const metadata: Metadata = { title: "Perfil" };

const ledgerFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      role: true,
      keyBalance: true,
      seal: true,
      keyLedger: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, delta: true, reason: true, createdAt: true },
      },
      _count: { select: { bookmarks: true, comments: true, likes: true } },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-lg space-y-8 pt-4">
      <header className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface text-rosewood-soft">
          <IconShield size={30} />
        </div>
        <div>
          <h1 className="font-display text-3xl text-snow">
            {user.name ?? user.username}
          </h1>
          <p className="flex items-center gap-2 font-sans text-sm text-fg-muted">
            @{user.username}
            {user.seal && (
              <span className="inline-flex items-center gap-1 text-rosewood-soft" title="Guardião">
                <IconSeal size={13} />
              </span>
            )}
            {user.role === "ADMIN" && (
              <span className="rounded-full border border-rosewood/40 bg-rosewood/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-rosewood-soft">
                admin
              </span>
            )}
          </p>
        </div>
      </header>

      {/* Saldo de $KEY (reputação / utilidade off-chain) */}
      <div className="space-y-4 rounded-2xl border border-border-soft bg-surface/40 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconToken size={28} className="text-rosewood-soft" />
            <div>
              <p className="font-display text-2xl text-snow">
                {user.keyBalance}{" "}
                <span className="font-sans text-sm text-fg-muted">$KEY</span>
              </p>
              <p className="font-sans text-[12px] text-fg-muted">
                chaves do conhecimento — reputação da plataforma
              </p>
            </div>
          </div>
          <div className="text-right font-sans text-[12px] text-fg-muted">
            <p>{user._count.likes} curtidas</p>
            <p>{user._count.bookmarks} salvos</p>
            <p>{user._count.comments} comentários</p>
          </div>
        </div>

        <p className="font-sans text-[11px] leading-relaxed text-fg-muted">
          $KEY é reputação e utilidade <em>dentro</em> do site — não é dinheiro,
          não há câmbio nem investimento. Ganhe escrevendo (+10 ao publicar),
          comentando (+1) e recebendo curtidas (+2). Gaste para apoiar autores,
          desbloquear notas trancadas e comprar cosméticos.
        </p>

        {/* Extrato */}
        {user.keyLedger.length > 0 && (
          <ul className="space-y-1 border-t border-border-soft pt-3">
            {user.keyLedger.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between font-sans text-[12px]"
              >
                <span className="text-fg-soft">{l.reason}</span>
                <span className="flex items-center gap-3">
                  <span
                    className={
                      l.delta >= 0 ? "text-teal-soft" : "text-rosewood-soft"
                    }
                  >
                    {l.delta >= 0 ? `+${l.delta}` : l.delta}
                  </span>
                  <time className="text-fg-muted">
                    {ledgerFmt.format(l.createdAt)}
                  </time>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-border-soft pt-3">
          <KeyShop
            hasSeal={!!user.seal}
            balance={user.keyBalance}
            cost={KEY_COSTS.SEAL}
          />
        </div>
      </div>

      {user.role === "ADMIN" && (
        <Link
          href="/admin"
          className="block rounded-xl border border-rosewood/40 bg-rosewood/10 px-4 py-3 text-center font-sans text-sm text-rosewood-soft transition hover:bg-rosewood/20"
        >
          Painel do admin →
        </Link>
      )}

      <ProfileForm
        name={user.name}
        bio={user.bio}
        avatarUrl={user.avatarUrl}
      />
    </div>
  );
}
