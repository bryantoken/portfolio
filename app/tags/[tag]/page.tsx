import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublishedNotes } from "@/lib/notes";
import { NoteCard } from "@/components/note-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  return { title: tag ? tag.name : "Tópico" };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const notes = await getPublishedNotes(slug);

  return (
    <div className="space-y-8">
      <header className="animate-fade-up pt-4">
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-fg-muted">
          Tópico
        </p>
        <h1 className="mt-1 font-display text-4xl text-snow md:text-5xl">
          {tag.name}
        </h1>
      </header>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center font-sans text-sm text-fg-muted">
            Nada plantado aqui ainda.
          </p>
        ) : (
          notes.map((n) => (
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
          ))
        )}
      </div>
    </div>
  );
}
