"use client";

import { useState } from "react";
import { CommentForm } from "@/components/comment-form";
import { IconSeal, IconQuill } from "@/components/icons";

export type CommentNode = {
  id: string;
  body: string;
  authorName: string;
  seal: string | null;
  createdAt: string; // ISO
  replies: CommentNode[];
};

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function CommentItem({
  node,
  noteId,
  isAuthed,
  depth,
}: {
  node: CommentNode;
  noteId: string;
  isAuthed: boolean;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);
  // Aninha visualmente até 3 níveis; além disso, respostas seguem no mesmo nível.
  const canIndent = depth < 3;

  return (
    <li className="rounded-xl border border-border-soft bg-surface/30 p-4">
      <div className="mb-1.5 flex items-center gap-2 font-sans text-[12px]">
        <span className="inline-flex items-center gap-1 font-medium text-fg">
          {node.authorName}
          {node.seal && (
            <IconSeal size={13} className="text-rosewood-soft" aria-label="Guardião" />
          )}
        </span>
        <span className="text-fg-muted">{fmt.format(new Date(node.createdAt))}</span>
      </div>
      <p className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-fg-soft">
        {node.body}
      </p>

      <div className="mt-2">
        <button
          onClick={() => setReplying((v) => !v)}
          className="inline-flex items-center gap-1.5 font-sans text-[12px] text-fg-muted transition hover:text-rosewood-soft"
        >
          <IconQuill size={13} /> {replying ? "Fechar" : "Responder"}
        </button>
      </div>

      {replying && (
        <div className="mt-3">
          <CommentForm
            noteId={noteId}
            isAuthed={isAuthed}
            parentId={node.id}
            compact
            placeholder={`Responder a ${node.authorName}…`}
            onDone={() => setReplying(false)}
          />
        </div>
      )}

      {node.replies.length > 0 && (
        <ul
          className={`mt-3 space-y-3 ${
            canIndent ? "border-l border-border-soft pl-4" : ""
          }`}
        >
          {node.replies.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              noteId={noteId}
              isAuthed={isAuthed}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CommentThread({
  noteId,
  isAuthed,
  comments,
}: {
  noteId: string;
  isAuthed: boolean;
  comments: CommentNode[];
}) {
  if (comments.length === 0) {
    return (
      <ul className="space-y-4">
        <li className="font-sans text-sm text-fg-muted">
          Ninguém comentou ainda. Seja o primeiro.
        </li>
      </ul>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((node) => (
        <CommentItem
          key={node.id}
          node={node}
          noteId={noteId}
          isAuthed={isAuthed}
          depth={0}
        />
      ))}
    </ul>
  );
}
