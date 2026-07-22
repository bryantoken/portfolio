import { prisma } from "@/lib/prisma";

const SITE = process.env.SITE_URL ?? "https://bryantoken.com";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const notes = await prisma.note.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 40,
    include: { author: { select: { name: true, username: true } } },
  });

  const items = notes
    .map((n) => {
      const url = `${SITE}/notes/${n.slug}`;
      const date = (n.publishedAt ?? n.plantedAt).toUTCString();
      return `    <item>
      <title>${esc(n.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <dc:creator>${esc(n.author.name ?? n.author.username)}</dc:creator>
      <description>${esc(n.excerpt ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>bryantoken — jardim digital</title>
    <link>${SITE}</link>
    <description>Registro da evolução de Bryan Borges. Nada aqui é verdade absoluta.</description>
    <language>pt-BR</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
