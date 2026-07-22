import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getExistingSlugs } from "@/lib/notes";
import { NoteEditor } from "@/components/note-editor";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [note, allTags, slugs] = await Promise.all([
    prisma.note.findUnique({ where: { id }, include: { tags: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    getExistingSlugs(),
  ]);

  if (!note) notFound();

  return (
    <div className="space-y-6 pt-4">
      <Link
        href="/admin"
        className="font-sans text-[12px] text-fg-muted transition hover:text-fg-soft"
      >
        ← escrivaninha
      </Link>
      <NoteEditor
        allTags={allTags}
        existingSlugs={[...slugs]}
        note={{
          id: note.id,
          title: note.title,
          slug: note.slug,
          content: note.content,
          excerpt: note.excerpt ?? "",
          coverImage: note.coverImage ?? "",
          stage: note.stage,
          status: note.status,
          gated: note.gated,
          tagSlugs: note.tags.map((t) => t.slug),
        }}
      />
    </div>
  );
}
