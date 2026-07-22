"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteNote } from "@/app/actions/notes";

export function DeleteNoteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [armed, setArmed] = useState(false);

  return (
    <button
      onClick={() => {
        if (!armed) {
          setArmed(true);
          setTimeout(() => setArmed(false), 3000);
          return;
        }
        start(async () => {
          await deleteNote(id);
          router.refresh();
        });
      }}
      disabled={pending}
      className="font-sans text-[12px] text-fg-muted transition hover:text-rosewood-soft"
    >
      {pending ? "…" : armed ? "confirmar?" : "excluir"}
    </button>
  );
}
