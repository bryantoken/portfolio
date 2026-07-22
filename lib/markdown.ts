// Utilitários de markdown + wiki-links [[slug]] para o digital garden.

const WIKILINK_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos (acentos)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Extrai os slugs referenciados via [[slug]] no conteúdo. */
export function extractWikiLinks(content: string): string[] {
  const slugs = new Set<string>();
  for (const match of content.matchAll(WIKILINK_RE)) {
    const target = match[1].trim();
    slugs.add(slugify(target));
  }
  return [...slugs];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Prepara o markdown para renderização:
 *  - converte [[slug]] / [[slug|rótulo]] em âncoras (classe `missing` p/ notas inexistentes);
 *  - converte ==destaque== em <mark>destaque</mark>.
 * Slugs de wiki-links ausentes recebem a classe `missing` (link fantasma).
 */
export function preprocessMarkdown(
  content: string,
  existingSlugs: Set<string>,
): string {
  const withLinks = content.replace(
    WIKILINK_RE,
    (_full, rawTarget, rawLabel) => {
      const label = (rawLabel ?? rawTarget).trim();
      const slug = slugify(rawTarget.trim());
      const missing = existingSlugs.has(slug) ? "" : " missing";
      return `<a class="wikilink${missing}" href="/notes/${slug}">${escapeHtml(
        label,
      )}</a>`;
    },
  );
  // ==destaque== → <mark> (evita colidir com ==== de headers setext)
  return withLinks.replace(/==(?!=)([^=\n]+?)==/g, "<mark>$1</mark>");
}

/** Gera um resumo em texto puro a partir do markdown. */
export function makeExcerpt(content: string, max = 180): string {
  const plain = content
    .replace(WIKILINK_RE, (_f, t, l) => (l ?? t).trim())
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // imagens
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links
    .replace(/[#>*_`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? plain.slice(0, max).trimEnd() + "…" : plain;
}

/** Estimativa de tempo de leitura (min). */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
