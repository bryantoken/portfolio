import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getExistingSlugs } from "@/lib/notes";
import { NoteEditor } from "@/components/note-editor";

export default async function NewNotePage() {
  const [allTags, slugs] = await Promise.all([
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    getExistingSlugs(),
  ]);

  return (
    <div className="space-y-6 pt-4">
      <Link
        href="/admin"
        className="font-sans text-[12px] text-fg-muted transition hover:text-fg-soft"
      >
        ← escrivaninha
      </Link>
      <NoteEditor allTags={allTags} existingSlugs={[...slugs]} />
    </div>
  );
}
