"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unlockNote } from "@/app/actions/social";
import { IconKey } from "@/components/icons";

/**
 * CTA de nota trancada. Aparece no lugar do conteúdo completo quando a
 * nota é `gated` e o leitor não é autor/admin nem a desbloqueou ainda.
 */
export function UnlockGate({
  noteId,
  isAuthed,
  cost,
}: {
  noteId: string;
  isAuthed: boolean;
  cost: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function unlock() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    setError(null);
    start(async () => {
      const res = await unlockNote(noteId);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-rosewood/30 bg-surface/40 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-rosewood/40 bg-rosewood/10 text-rosewood-soft">
        <IconKey size={26} />
      </div>
      <h3 className="font-display text-2xl text-snow">Nota trancada</h3>
      <p className="mx-auto mt-2 max-w-sm font-sans text-sm text-fg-muted">
        Esta chave do conhecimento está guardada. Gaste {cost} $KEY para abri-la —
        reputação que você ganha escrevendo, comentando e recebendo curtidas.
      </p>
      <button
        onClick={unlock}
        disabled={pending}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-rosewood px-6 py-2.5 font-sans text-sm font-medium text-snow shadow-glow transition hover:bg-rosewood-deep disabled:opacity-50"
      >
        <IconKey size={16} />
        {pending ? "Abrindo…" : isAuthed ? `Desbloquear (−${cost} $KEY)` : "Entrar para desbloquear"}
      </button>
      {error && <p className="mt-3 font-sans text-[12px] text-rosewood-soft">{error}</p>}
    </div>
  );
}
