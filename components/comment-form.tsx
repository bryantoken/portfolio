"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addComment } from "@/app/actions/social";

export function CommentForm({
  noteId,
  isAuthed,
  parentId,
  compact = false,
  placeholder = "Escreva um comentário…",
  onDone,
}: {
  noteId: string;
  isAuthed: boolean;
  parentId?: string;
  compact?: boolean;
  placeholder?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!isAuthed) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/30 p-5 text-center font-sans text-sm text-fg-muted">
        <Link href="/login" className="text-rosewood-soft hover:text-rosewood">
          Entre
        </Link>{" "}
        para deixar sua marca nos comentários.
      </div>
    );
  }

  function submit() {
    setError(null);
    start(async () => {
      const res = await addComment({ noteId, body, parentId });
      if (res?.error) {
        setError(res.error);
      } else {
        setBody("");
        onDone?.();
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={compact ? 2 : 3}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-border bg-surface/60 p-3.5 font-sans text-sm text-fg outline-none transition placeholder:text-fg-muted focus:border-rosewood/50"
      />
      {error && <p className="font-sans text-xs text-rosewood-soft">{error}</p>}
      <div className="flex justify-end gap-2">
        {onDone && (
          <button
            onClick={onDone}
            className="rounded-full border border-border px-4 py-2 font-sans text-sm text-fg-muted transition hover:text-fg-soft"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={submit}
          disabled={pending || !body.trim()}
          className="rounded-full bg-rosewood px-5 py-2 font-sans text-sm font-medium text-snow transition hover:bg-rosewood-deep disabled:opacity-50"
        >
          {pending ? "Enviando…" : compact ? "Responder" : "Comentar"}
        </button>
      </div>
    </div>
  );
}
