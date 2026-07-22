import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

/**
 * Renderiza o markdown de uma nota. O `content` já vem pré-processado
 * (wiki-links [[..]] e ==destaques== convertidos para HTML por lib/markdown).
 *
 * Notas são escritas somente pelo admin (conteúdo confiável), então
 * permitimos HTML bruto (rehype-raw) para embeds de vídeo/imagem/gif.
 */
export function NoteContent({ content }: { content: string }) {
  return (
    <div className="prose-garden">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
