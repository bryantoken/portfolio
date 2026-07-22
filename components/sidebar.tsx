import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StageBadge } from "@/components/stage-badge";
import { IconScroll, IconTorch } from "@/components/icons";

// Barra lateral (desktop) estilo "ano 2000": últimos pergaminhos + blocos
// curados pelo admin (imagens/gifs, links, HTML). Server component.

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface/50 shadow-float">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.18em] text-fg-soft">
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-rosewood" />
        {title}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

export async function Sidebar() {
  const [notes, widgets] = await Promise.all([
    prisma.note.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { slug: true, title: true, stage: true },
    }),
    prisma.widget.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Últimos pergaminhos */}
      <Panel title="Últimos pergaminhos">
        <ul className="space-y-2.5">
          {notes.map((n) => (
            <li key={n.slug}>
              <Link
                href={`/notes/${n.slug}`}
                className="group flex items-start gap-2 text-[13px] leading-snug text-fg-soft transition hover:text-snow"
              >
                <IconScroll size={14} className="mt-0.5 shrink-0 text-fg-muted group-hover:text-rosewood-soft" />
                <span>
                  {n.title}
                  <span className="mt-0.5 block">
                    <StageBadge stage={n.stage} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {notes.length === 0 && (
            <li className="text-[12px] text-fg-muted">Nada plantado ainda.</li>
          )}
        </ul>
      </Panel>

      {/* Blocos curados pelo admin */}
      {widgets.map((w) => {
        if (w.kind === "IMAGE" && w.imageUrl) {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={w.imageUrl}
              alt={w.title ?? ""}
              className="w-full rounded border border-border"
            />
          );
          return (
            <Panel key={w.id} title={w.title ?? "•"}>
              {w.linkUrl ? (
                <a href={w.linkUrl} target="_blank" rel="noreferrer noopener">
                  {img}
                </a>
              ) : (
                img
              )}
            </Panel>
          );
        }
        if (w.kind === "LINK" && w.linkUrl) {
          return (
            <Panel key={w.id} title={w.title ?? "Link"}>
              <a
                href={w.linkUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 text-[13px] text-teal-soft underline decoration-teal/40 underline-offset-2 transition hover:text-teal"
              >
                <IconTorch size={14} /> {w.title ?? w.linkUrl}
              </a>
            </Panel>
          );
        }
        if (w.kind === "HTML" && w.body) {
          return (
            <Panel key={w.id} title={w.title ?? "•"}>
              {/* HTML confiável — só o admin cria widgets */}
              <div
                className="prose-sidebar text-[13px] text-fg-soft [&_a]:text-teal-soft [&_img]:rounded [&_marquee]:text-rosewood-soft"
                dangerouslySetInnerHTML={{ __html: w.body }}
              />
            </Panel>
          );
        }
        return null;
      })}

      <p className="px-1 text-center font-sans text-[10px] uppercase tracking-[0.18em] text-fg-muted">
        ✦ bryantoken ✦
      </p>
    </div>
  );
}
