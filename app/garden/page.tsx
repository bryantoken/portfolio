import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPublishedNotes } from "@/lib/notes";
import { NoteCard } from "@/components/note-card";
import { IconScroll } from "@/components/icons";

export const metadata: Metadata = {
  title: "Jardim",
  description: "Todas as notas e ensaios — filtre por tópico.",
};

export default async function GardenPage() {
  const [notes, tags] = await Promise.all([
    getPublishedNotes(),
    prisma.tag.findMany({
      where: { notes: { some: { status: "PUBLISHED" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <header className="animate-fade-up pt-4">
        <h1 className="flex items-center gap-3 font-display text-4xl text-snow md:text-5xl">
          <IconScroll size={34} /> O jardim
        </h1>
        <p className="mt-3 font-sans text-fg-soft">
          {notes.length} {notes.length === 1 ? "nota" : "notas"} plantadas.
          Navegue sem ordem — jardins não são lineares.
        </p>
      </header>

      {tags.length > 0 && (
        <nav className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tags/${t.slug}`}
              className="rounded-full border border-border-soft bg-surface/40 px-3 py-1 font-sans text-[12px] text-fg-soft transition hover:border-teal/40 hover:text-teal-soft"
            >
              {t.name}
            </Link>
          ))}
        </nav>
      )}

      <div className="space-y-4">
        {notes.map((n) => (
          <NoteCard
            key={n.id}
            slug={n.slug}
            title={n.title}
            excerpt={n.excerpt}
            stage={n.stage}
            publishedAt={n.publishedAt}
            tags={n.tags}
            counts={{ likes: n._count.likes, comments: n._count.comments }}
          />
        ))}
      </div>
    </div>
  );
}
