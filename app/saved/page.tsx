import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteCard } from "@/components/note-card";
import { IconSeal } from "@/components/icons";

export const metadata: Metadata = { title: "Salvos" };

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      note: {
        include: {
          tags: true,
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <header className="animate-fade-up pt-4">
        <h1 className="flex items-center gap-3 font-display text-4xl text-snow md:text-5xl">
          <IconSeal size={32} /> Salvos
        </h1>
        <p className="mt-2 font-sans text-fg-soft">Suas notas marcadas.</p>
      </header>

      <div className="space-y-4">
        {bookmarks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center font-sans text-sm text-fg-muted">
            Você ainda não salvou nada.
          </p>
        ) : (
          bookmarks.map(({ note }) => (
            <NoteCard
              key={note.id}
              slug={note.slug}
              title={note.title}
              excerpt={note.excerpt}
              stage={note.stage}
              publishedAt={note.publishedAt}
              tags={note.tags}
              counts={{
                likes: note._count.likes,
                comments: note._count.comments,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
