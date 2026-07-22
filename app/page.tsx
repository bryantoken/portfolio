import Link from "next/link";
import { getPublishedNotes } from "@/lib/notes";
import { NoteCard } from "@/components/note-card";
import { IconKey, IconScroll } from "@/components/icons";

export default async function HomePage() {
  const notes = await getPublishedNotes();

  return (
    <div className="space-y-16">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="animate-fade-up pt-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface/50 px-3 py-1 font-sans text-[11px] uppercase tracking-[0.2em] text-fg-muted">
          <IconKey size={14} />
          jardim digital · indieweb
        </div>

        <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-snow sm:text-6xl md:text-7xl">
          A chave é
          <br />
          <span className="text-rosewood">o conhecimento.</span>
        </h1>

        <p className="mt-7 max-w-xl font-sans text-lg leading-relaxed text-fg-soft">
          Aqui eu marco minha evolução — tecnologia, religião, filosofia,
          empreendedorismo e autoconhecimento. Ideias meio prontas, mudanças de
          pensamento, arrependimentos.{" "}
          <span className="text-fg">Nada aqui é pra ser tomado como verdade</span>
          {" "}— só o registro honesto de quem está pensando em voz alta.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/garden"
            className="inline-flex items-center gap-2 rounded-full bg-rosewood px-5 py-2.5 font-sans text-sm font-medium text-snow shadow-glow transition hover:bg-rosewood-deep"
          >
            <IconScroll size={16} /> Explorar o jardim
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-sans text-sm text-fg-soft transition hover:border-rosewood/40 hover:text-fg"
          >
            Quem escreve
          </Link>
        </div>
      </section>

      {/* ── Feed ─────────────────────────────────────────────── */}
      <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="mb-6 flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.2em] text-fg-muted">
          <span>Recém-plantadas</span>
          <span className="section-rule" />
        </div>

        {notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center font-sans text-sm text-fg-muted">
            O jardim ainda está sendo preparado. Volte em breve.
          </p>
        ) : (
          <div className="space-y-4">
            {notes.slice(0, 6).map((n) => (
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
        )}
      </section>
    </div>
  );
}
