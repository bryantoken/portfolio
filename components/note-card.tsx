import Link from "next/link";
import { Stage } from "@prisma/client";
import { StageBadge } from "@/components/stage-badge";
import { IconHeart, IconQuill } from "@/components/icons";

type NoteCardProps = {
  slug: string;
  title: string;
  excerpt?: string | null;
  stage: Stage;
  publishedAt?: Date | null;
  tags: { slug: string; name: string }[];
  counts: { likes: number; comments: number };
};

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function NoteCard(n: NoteCardProps) {
  return (
    <article className="h-entry group relative rounded-2xl border border-border-soft bg-surface/40 p-5 transition-all duration-300 hover:border-rosewood/40 hover:bg-surface/70 md:p-6">
      <div className="mb-3 flex items-center gap-3">
        <StageBadge stage={n.stage} />
        {n.publishedAt && (
          <time
            className="dt-published font-sans text-[11px] uppercase tracking-wider text-fg-muted"
            dateTime={n.publishedAt.toISOString()}
          >
            {fmt.format(n.publishedAt)}
          </time>
        )}
      </div>

      <Link href={`/notes/${n.slug}`} className="u-url">
        <h2 className="p-name font-display text-2xl leading-tight text-snow transition-colors group-hover:text-rosewood-soft md:text-3xl">
          {n.title}
        </h2>
      </Link>

      {n.excerpt && (
        <p className="p-summary mt-2 font-sans text-[15px] leading-relaxed text-fg-soft">
          {n.excerpt}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 font-sans text-[12px] text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <IconHeart size={14} /> {n.counts.likes}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconQuill size={14} /> {n.counts.comments}
        </span>
        <span className="ml-auto flex flex-wrap gap-1.5">
          {n.tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tags/${t.slug}`}
              className="rounded-full border border-border-soft px-2 py-0.5 text-[10px] uppercase tracking-wider transition hover:border-teal/40 hover:text-teal-soft"
            >
              {t.name}
            </Link>
          ))}
        </span>
      </div>
    </article>
  );
}
