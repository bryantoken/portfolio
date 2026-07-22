"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWidget, deleteWidget } from "@/app/actions/widgets";
import type { FormState } from "@/lib/types";
import { IconSeal } from "@/components/icons";

type Widget = {
  id: string;
  kind: "IMAGE" | "LINK" | "HTML";
  title: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  body: string | null;
};

const initial: FormState = {};

export function WidgetManager({ widgets }: { widgets: Widget[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createWidget, initial);
  const [kind, setKind] = useState<"IMAGE" | "LINK" | "HTML">("IMAGE");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [, startDelete] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setImageUrl("");
      router.refresh();
    }
  }, [state?.ok, router]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setUploadError(data.error ?? "Falha no upload.");
      else setImageUrl(data.url);
    } catch {
      setUploadError("Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  const field =
    "w-full rounded-lg border border-surface-3 bg-surface-2 px-3 py-2 font-sans text-sm text-snow outline-none transition placeholder:text-fg-muted focus:border-rosewood/60";

  return (
    <div className="space-y-8">
      {/* ── Novo bloco ─────────────────────────────────────────── */}
      <form ref={formRef} action={formAction} className="space-y-3 rounded-2xl border border-border-soft bg-surface/40 p-5">
        <div className="flex flex-wrap gap-2">
          {(["IMAGE", "LINK", "HTML"] as const).map((k) => (
            <label
              key={k}
              className="cursor-pointer select-none rounded-full border border-border-soft px-3 py-1 font-sans text-[12px] text-fg-soft transition has-[:checked]:border-rosewood/60 has-[:checked]:bg-rosewood/15 has-[:checked]:text-rosewood-soft"
            >
              <input
                type="radio"
                name="kind"
                value={k}
                checked={kind === k}
                onChange={() => setKind(k)}
                className="hidden"
              />
              {k === "IMAGE" ? "Imagem/GIF" : k === "LINK" ? "Link" : "HTML"}
            </label>
          ))}
        </div>

        <input name="title" placeholder="título do bloco (opcional)" className={field} />

        {kind === "IMAGE" && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={onFile}
                className="block w-full font-sans text-[12px] text-fg-soft file:mr-3 file:rounded-full file:border-0 file:bg-rosewood file:px-3 file:py-1.5 file:font-sans file:text-[12px] file:text-snow hover:file:bg-rosewood-deep"
              />
              {uploading && <span className="text-[12px] text-fg-muted">enviando…</span>}
            </div>
            {uploadError && <p className="text-[12px] text-rosewood-soft">{uploadError}</p>}
            <input
              name="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="…ou cole a URL de uma imagem/gif"
              className={field}
            />
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="max-h-40 rounded border border-border" />
            )}
            <input name="linkUrl" placeholder="link ao clicar (opcional)" className={field} />
          </div>
        )}

        {kind === "LINK" && (
          <input name="linkUrl" placeholder="https://… (destino do link)" className={field} />
        )}

        {kind === "HTML" && (
          <textarea
            name="body"
            rows={4}
            placeholder="<marquee>…</marquee> ou qualquer HTML confiável"
            className={`${field} resize-y font-mono`}
          />
        )}

        {state?.error && <p className="font-sans text-xs text-rosewood-soft">{state.error}</p>}

        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-full bg-rosewood px-5 py-2 font-sans text-sm font-medium text-snow transition hover:bg-rosewood-deep disabled:opacity-50"
        >
          {pending ? "Adicionando…" : "Adicionar bloco"}
        </button>
      </form>

      {/* ── Blocos atuais ──────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="font-sans text-[11px] uppercase tracking-wider text-fg-muted">
          Blocos na barra lateral ({widgets.length})
        </p>
        {widgets.length === 0 && (
          <p className="font-sans text-sm text-fg-muted">
            Nenhum bloco ainda — adicione imagens, gifs ou links acima.
          </p>
        )}
        <ul className="space-y-2">
          {widgets.map((w) => (
            <li
              key={w.id}
              className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface/30 p-3"
            >
              {w.kind === "IMAGE" && w.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.imageUrl} alt="" className="h-10 w-10 rounded border border-border object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded border border-border text-fg-muted">
                  <IconSeal size={16} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm text-fg">
                  {w.title ?? w.linkUrl ?? w.kind}
                </p>
                <p className="font-sans text-[11px] uppercase tracking-wider text-fg-muted">
                  {w.kind}
                </p>
              </div>
              <button
                onClick={() =>
                  startDelete(async () => {
                    await deleteWidget(w.id);
                    router.refresh();
                  })
                }
                className="rounded-full border border-border px-3 py-1.5 font-sans text-[12px] text-fg-muted transition hover:border-rosewood/50 hover:text-rosewood-soft"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
