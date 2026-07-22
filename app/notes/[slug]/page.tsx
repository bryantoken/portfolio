import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNoteBySlug, getExistingSlugs, STAGE_LABEL } from "@/lib/notes";
import { preprocessMarkdown, readingTime } from "@/lib/markdown";
import { NoteContent } from "@/components/note-content";
import { StageBadge } from "@/components/stage-badge";
import { SocialBar } from "@/components/social-bar";
import { CommentForm } from "@/components/comment-form";
import { CommentThread, type CommentNode } from "@/components/comment-thread";
import { UnlockGate } from "@/components/unlock-gate";
import { KEY_COSTS } from "@/lib/key";
import { IconKey } from "@/components/icons";

/** Monta a árvore de comentários (aninhados) a partir da lista plana. */
function buildCommentTree(
  rows: {
    id: string;
    body: string;
    parentId: string | null;
    createdAt: Date;
    user: { username: string; name: string | null; seal: string | null };
  }[],
): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];
  for (const r of rows) {
    map.set(r.id, {
      id: r.id,
      body: r.body,
      authorName: r.user.name ?? r.user.username,
      seal: r.user.seal,
      createdAt: r.createdAt.toISOString(),
      replies: [],
    });
  }
  for (const r of rows) {
    const node = map.get(r.id)!;
    const parent = r.parentId ? map.get(r.parentId) : null;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }
  return roots;
}

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await prisma.note.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });
  if (!note) return { title: "Nota não encontrada" };
  return {
    title: note.title,
    description: note.excerpt ?? undefined,
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [session, note, existingSlugs] = await Promise.all([
    auth(),
    getNoteBySlug(slug),
    getExistingSlugs(),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";
  if (!note || (note.status !== "PUBLISHED" && !isAdmin)) notFound();

  const userId = session?.user?.id;
  const [liked, bookmarked, commentRows, unlock] = await Promise.all([
    userId
      ? prisma.like.findUnique({
          where: { userId_noteId: { userId, noteId: note.id } },
        })
      : null,
    userId
      ? prisma.bookmark.findUnique({
          where: { userId_noteId: { userId, noteId: note.id } },
        })
      : null,
    prisma.comment.findMany({
      where: { noteId: note.id },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { username: true, name: true, seal: true } },
      },
    }),
    userId && note.gated
      ? prisma.unlock.findUnique({
          where: { userId_noteId: { userId, noteId: note.id } },
        })
      : null,
  ]);

  const comments = buildCommentTree(commentRows);
  const commentCount = commentRows.length;
  const isAuthor = userId === note.authorId;
  // Conteúdo trancado: só o autor, o admin ou quem desbloqueou lê na íntegra.
  const locked = note.gated && !isAdmin && !isAuthor && !unlock;

  const html = preprocessMarkdown(note.content, existingSlugs);
  const mins = readingTime(note.content);
  const backlinks = note.incoming.filter((b) => b.source.status === "PUBLISHED");

  return (
    <article className="h-entry space-y-8">
      {/* ── Cabeçalho ─────────────────────────────────────────── */}
      <header className="animate-fade-up space-y-4 pt-2">
        <Link
          href="/garden"
          className="inline-flex items-center gap-1.5 font-sans text-[12px] text-fg-muted transition hover:text-fg-soft"
        >
          ← jardim
        </Link>

        {note.status !== "PUBLISHED" && (
          <span className="ml-2 rounded-full border border-rosewood/40 bg-rosewood/10 px-2 py-0.5 font-sans text-[11px] uppercase tracking-wider text-rosewood-soft">
            rascunho
          </span>
        )}

        <h1 className="p-name font-display text-4xl leading-[1.05] text-snow md:text-6xl">
          {note.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 font-sans text-[12px] text-fg-muted">
          <StageBadge stage={note.stage} />
          {note.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <IconKey size={13} /> plantado em{" "}
              <time dateTime={note.publishedAt.toISOString()}>
                {fmt.format(note.publishedAt)}
              </time>
            </span>
          )}
          <span>· {mins} min de leitura</span>
          {note.tendedAt &&
            note.publishedAt &&
            note.tendedAt.getTime() - note.publishedAt.getTime() > 86_400_000 && (
              <span>· cuidado em {fmt.format(note.tendedAt)}</span>
            )}
        </div>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {note.tags.map((t) => (
              <Link
                key={t.slug}
                href={`/tags/${t.slug}`}
                className="p-category rounded-full border border-border-soft px-2.5 py-0.5 font-sans text-[11px] uppercase tracking-wider text-fg-soft transition hover:border-teal/40 hover:text-teal-soft"
              >
                {t.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ── Conteúdo ──────────────────────────────────────────── */}
      {locked ? (
        <div className="space-y-6">
          {note.excerpt && (
            <p className="font-display text-xl leading-relaxed text-fg-soft">
              {note.excerpt}
            </p>
          )}
          <UnlockGate noteId={note.id} isAuthed={!!userId} cost={KEY_COSTS.UNLOCK} />
        </div>
      ) : (
        <div className="e-content">
          <NoteContent content={html} />
        </div>
      )}

      {/* Disclaimer do jardim */}
      <p className="rounded-xl border border-border-soft bg-surface/30 px-4 py-3 font-sans text-[12px] italic leading-relaxed text-fg-muted">
        Isto é um jardim digital. O que está escrito aqui reflete o que eu pensava
        quando plantei ({STAGE_LABEL[note.stage]}) — pode ter mudado. Nada é
        verdade absoluta.
      </p>

      {/* ── Ações sociais ─────────────────────────────────────── */}
      <div className="border-y border-border-soft py-5">
        <SocialBar
          noteId={note.id}
          title={note.title}
          isAuthed={!!userId}
          initialLiked={!!liked}
          likeCount={note._count.likes}
          initialBookmarked={!!bookmarked}
          commentCount={commentCount}
          canTip={!!userId && !isAuthor}
          tipCost={KEY_COSTS.TIP}
        />
      </div>

      {/* ── Backlinks ─────────────────────────────────────────── */}
      {backlinks.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] text-fg-muted">
            Mencionado em
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {backlinks.map((b) => (
              <Link
                key={b.source.slug}
                href={`/notes/${b.source.slug}`}
                className="rounded-xl border border-border-soft bg-surface/40 p-4 transition hover:border-rosewood/40"
              >
                <p className="font-display text-lg text-snow">{b.source.title}</p>
                {b.source.excerpt && (
                  <p className="mt-1 font-sans text-[13px] text-fg-muted">
                    {b.source.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Comentários ───────────────────────────────────────── */}
      <section id="comentarios" className="space-y-5 scroll-mt-24">
        <h2 className="font-display text-2xl text-snow">
          Comentários{" "}
          <span className="font-sans text-base text-fg-muted">
            ({commentCount})
          </span>
        </h2>

        <CommentForm noteId={note.id} isAuthed={!!userId} />

        <CommentThread
          noteId={note.id}
          isAuthed={!!userId}
          comments={comments}
        />
      </section>
    </article>
  );
}
