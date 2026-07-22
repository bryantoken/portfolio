"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buySeal } from "@/app/actions/account";
import { IconSeal } from "@/components/icons";

export function KeyShop({
  hasSeal,
  balance,
  cost,
}: {
  hasSeal: boolean;
  balance: number;
  cost: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (hasSeal) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rosewood/40 bg-rosewood/10 px-4 py-3 font-sans text-sm text-rosewood-soft">
        <IconSeal size={18} /> Selo do Guardião — adquirido
      </div>
    );
  }

  function buy() {
    setError(null);
    start(async () => {
      const res = await buySeal();
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  const canAfford = balance >= cost;

  return (
    <div className="space-y-1.5">
      <button
        onClick={buy}
        disabled={pending || !canAfford}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/40 px-4 py-3 font-sans text-sm text-fg-soft transition hover:border-rosewood/40 hover:text-rosewood-soft disabled:opacity-50"
      >
        <IconSeal size={18} />
        {pending ? "Comprando…" : `Comprar selo do Guardião (−${cost} $KEY)`}
      </button>
      {!canAfford && (
        <p className="font-sans text-[12px] text-fg-muted">
          Faltam chaves — escreva, comente e receba curtidas para acumular.
        </p>
      )}
      {error && <p className="font-sans text-[12px] text-rosewood-soft">{error}</p>}
    </div>
  );
}
