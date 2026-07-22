import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NoteCard } from "@/components/note-card";
import { IconLoupe } from "@/components/icons";

export const metadata: Metadata = { title: "Buscar" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const notes = query
    ? await prisma.note.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        include: {
          tags: true,
          _count: { select: { likes: true, comments: true } },
        },
      })
    : [];

  return (
    <div className="space-y-8">
      <header className="animate-fade-up pt-4">
        <h1 className="flex items-center gap-3 font-display text-4xl text-snow md:text-5xl">
          <IconLoupe size={30} /> Buscar
        </h1>
      </header>

      <form action="/search" className="relative">
        <input
          name="q"
          defaultValue={query}
          placeholder="procure por uma ideia…"
          autoFocus
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3.5 pr-12 font-sans text-sm text-fg outline-none transition placeholder:text-fg-muted focus:border-rosewood/50"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted transition hover:text-rosewood-soft"
        >
          <IconLoupe size={20} />
        </button>
      </form>

      {query && (
        <p className="font-sans text-sm text-fg-muted">
          {notes.length} resultado(s) para{" "}
          <span className="text-fg">“{query}”</span>
        </p>
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
        {query && notes.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center font-sans text-sm text-fg-muted">
            Nada encontrado.{" "}
            <Link href="/garden" className="text-rosewood-soft">
              Ver o jardim inteiro
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
