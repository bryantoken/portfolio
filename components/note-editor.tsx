"use client";

import { useActionState, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { saveNote } from "@/app/actions/notes";
import { preprocessMarkdown } from "@/lib/markdown";
import type { FormState } from "@/lib/types";
import {
  IconQuill,
  IconScroll,
  IconLoupe,
  IconBook,
} from "@/components/icons";

type EditorNote = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  stage: "SEEDLING" | "BUDDING" | "EVERGREEN";
  status: "DRAFT" | "PUBLISHED";
  gated: boolean;
  tagSlugs: string[];
};

type Props = {
  note?: EditorNote;
  allTags: { slug: string; name: string }[];
  existingSlugs: string[];
};

const STAGES = [
  ["SEEDLING", "Semente"],
  ["BUDDING", "Brotando"],
  ["EVERGREEN", "Perene"],
] as const;

const initial: FormState = {};

export function NoteEditor({ note, allTags, existingSlugs }: Props) {
  const [state, formAction, pending] = useActionState(saveNote, initial);
  const [content, setContent] = useState(note?.content ?? "");
  const [preview, setPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const slugSet = new Set(existingSlugs);

  function surround(before: string, after = before, placeholder = "texto") {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = s + before.length;
      ta.selectionEnd = s + before.length + sel.length;
    });
  }

  function prefixLine(prefix: string) {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, value } = ta;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = s + prefix.length;
    });
  }

  const tools: [string, () => void, React.ReactNode][] = [
    ["negrito", () => surround("**"), <strong key="b">B</strong>],
    ["itálico", () => surround("*"), <em key="i">i</em>],
    ["marca-texto", () => surround("==", "==", "destaque"), <mark key="m" className="bg-rosewood/40 px-1 text-snow">H</mark>],
    ["título", () => prefixLine("## "), <span key="h">H2</span>],
    ["citação", () => prefixLine("> "), <span key="q">&ldquo;&rdquo;</span>],
    ["lista", () => prefixLine("- "), <span key="l">•</span>],
    ["link", () => surround("[", "](https://)", "rótulo"), <span key="a">↗</span>],
    ["imagem/gif", () => surround("![", "](https://)", "alt"), <IconBook key="img" size={15} />],
    ["referência [[..]]", () => surround("[[", "]]", "slug-da-nota"), <IconScroll key="wl" size={15} />],
    ["separador", () => prefixLine("\n---\n"), <span key="hr">—</span>],
  ];

  return (
    <form action={formAction} className="space-y-5">
      {note?.id && <input type="hidden" name="id" value={note.id} />}

      <input
        name="title"
        defaultValue={note?.title}
        required
        placeholder="Título da nota"
        className="w-full bg-transparent font-display text-4xl text-snow outline-none placeholder:text-fg-muted"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="slug"
          defaultValue={note?.slug}
          placeholder="slug (auto se vazio)"
          className="rounded-lg border border-border bg-surface/60 px-3 py-2 font-mono text-[13px] text-fg-soft outline-none focus:border-rosewood/50"
        />
        <input
          name="coverImage"
          defaultValue={note?.coverImage}
          type="url"
          placeholder="imagem de capa (URL, opcional)"
          className="rounded-lg border border-border bg-surface/60 px-3 py-2 font-sans text-[13px] text-fg-soft outline-none focus:border-rosewood/50"
        />
      </div>

      <input
        name="excerpt"
        defaultValue={note?.excerpt}
        maxLength={280}
        placeholder="resumo (auto se vazio)"
        className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2 font-sans text-[13px] text-fg-soft outline-none focus:border-rosewood/50"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border-soft bg-surface/40 p-1.5">
        {tools.map(([label, fn, icon]) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={fn}
            className="flex h-8 min-w-8 items-center justify-center rounded px-2 font-sans text-sm text-fg-soft transition hover:bg-rosewood/15 hover:text-rosewood-soft"
          >
            {icon}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className={`ml-auto flex h-8 items-center gap-1.5 rounded px-3 font-sans text-[12px] transition ${
            preview
              ? "bg-teal/20 text-teal-soft"
              : "text-fg-soft hover:bg-surface"
          }`}
        >
          <IconLoupe size={14} /> {preview ? "Editando" : "Preview"}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div className="min-h-[24rem] rounded-xl border border-border-soft bg-surface/20 p-5">
          <div className="prose-garden">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {preprocessMarkdown(content, slugSet)}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <textarea
          ref={ref}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={18}
          placeholder="Escreva em markdown… use [[slug]] pra referenciar outra nota."
          className="w-full resize-y rounded-xl border border-border bg-surface/40 p-5 font-mono text-[14px] leading-relaxed text-fg outline-none transition placeholder:text-fg-muted focus:border-rosewood/50"
        />
      )}

      {/* Tags */}
      <div>
        <p className="mb-2 font-sans text-[11px] uppercase tracking-wider text-fg-muted">
          Tópicos
        </p>
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => (
            <label
              key={t.slug}
              className="cursor-pointer select-none rounded-full border border-border-soft px-3 py-1 font-sans text-[12px] text-fg-soft transition has-[:checked]:border-rosewood/60 has-[:checked]:bg-rosewood/15 has-[:checked]:text-rosewood-soft"
            >
              <input
                type="checkbox"
                name="tags"
                value={t.slug}
                defaultChecked={note?.tagSlugs.includes(t.slug)}
                className="hidden"
              />
              {t.name}
            </label>
          ))}
        </div>
      </div>

      {/* Estágio + status + salvar */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border-soft pt-5">
        <label className="flex items-center gap-2 font-sans text-[13px] text-fg-soft">
          Estágio
          <select
            name="stage"
            defaultValue={note?.stage ?? "SEEDLING"}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none focus:border-rosewood/50"
          >
            {STAGES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 font-sans text-[13px] text-fg-soft">
          Status
          <select
            name="status"
            defaultValue={note?.status ?? "DRAFT"}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none focus:border-rosewood/50"
          >
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicar</option>
          </select>
        </label>

        <label className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-border-soft px-3 py-2 font-sans text-[13px] text-fg-soft transition has-[:checked]:border-rosewood/60 has-[:checked]:text-rosewood-soft">
          <input
            type="checkbox"
            name="gated"
            defaultChecked={note?.gated}
            className="accent-rosewood"
          />
          Trancada ($KEY)
        </label>

        {state?.error && (
          <p className="font-sans text-xs text-rosewood-soft">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-rosewood px-6 py-2.5 font-sans text-sm font-medium text-snow shadow-glow transition hover:bg-rosewood-deep disabled:opacity-50"
        >
          <IconQuill size={16} /> {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
