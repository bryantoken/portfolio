import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STAGE_LABEL } from "@/lib/notes";
import { DeleteNoteButton } from "@/components/delete-note-button";
import { IconQuill, IconTower } from "@/components/icons";

export const metadata: Metadata = { title: "Admin" };

const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export default async function AdminPage() {
  const notes = await prisma.note.findMany({
    orderBy: { tendedAt: "desc" },
    include: { _count: { select: { likes: true, comments: true } } },
  });

  const published = notes.filter((n) => n.status === "PUBLISHED").length;

  return (
    <div className="space-y-8 pt-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-snow">Escrivaninha</h1>
          <p className="mt-1 font-sans text-sm text-fg-muted">
            {notes.length} notas · {published} publicadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/widgets"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 font-sans text-sm text-fg-soft transition hover:border-rosewood/50 hover:text-fg"
          >
            <IconTower size={16} /> Barra lateral
          </Link>
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 rounded-full bg-rosewood px-4 py-2.5 font-sans text-sm font-medium text-snow shadow-glow transition hover:bg-rosewood-deep"
          >
            <IconQuill size={16} /> Nova nota
          </Link>
        </div>
      </header>

      <ul className="divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface/30">
        {notes.length === 0 && (
          <li className="p-6 text-center font-sans text-sm text-fg-muted">
            Nenhuma nota ainda. Plante a primeira.
          </li>
        )}
        {notes.map((n) => (
          <li
            key={n.id}
            className="flex items-center justify-between gap-4 p-4 md:p-5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rotate-45 ${
                    n.status === "PUBLISHED" ? "bg-teal" : "bg-fg-muted"
                  }`}
                />
                <Link
                  href={`/admin/edit/${n.id}`}
                  className="truncate font-display text-lg text-snow transition hover:text-rosewood-soft"
                >
                  {n.title}
                </Link>
              </div>
              <p className="mt-1 font-sans text-[12px] text-fg-muted">
                {STAGE_LABEL[n.stage]} ·{" "}
                {n.status === "PUBLISHED" ? "publicada" : "rascunho"} ·{" "}
                {fmt.format(n.tendedAt)} · {n._count.likes}♥{" "}
                {n._count.comments}✎
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <Link
                href={`/notes/${n.slug}`}
                className="font-sans text-[12px] text-fg-muted transition hover:text-fg-soft"
              >
                ver
              </Link>
              <Link
                href={`/admin/edit/${n.id}`}
                className="font-sans text-[12px] text-teal-soft transition hover:text-teal"
              >
                editar
              </Link>
              <DeleteNoteButton id={n.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
