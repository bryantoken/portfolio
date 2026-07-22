"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  slugify,
  extractWikiLinks,
  makeExcerpt,
} from "@/lib/markdown";
import { Stage, NoteStatus } from "@prisma/client";
import { awardKey, KEY_REWARDS } from "@/lib/key";
import type { FormState } from "@/lib/types";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Acesso restrito ao admin.");
  }
  return session.user.id;
}

const noteSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Título obrigatório.").max(160),
  slug: z.string().trim().optional(),
  content: z.string().min(1, "Conteúdo vazio."),
  excerpt: z.string().trim().max(280).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  stage: z.nativeEnum(Stage),
  status: z.nativeEnum(NoteStatus),
  gated: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

/** Recalcula os backlinks a partir dos [[slug]] no conteúdo. */
async function syncBacklinks(noteId: string, content: string) {
  const referenced = extractWikiLinks(content);
  const targets = referenced.length
    ? await prisma.note.findMany({
        where: { slug: { in: referenced } },
        select: { id: true },
      })
    : [];

  await prisma.backlink.deleteMany({ where: { sourceNoteId: noteId } });
  await prisma.backlink.createMany({
    data: targets
      .filter((t) => t.id !== noteId)
      .map((t) => ({ sourceNoteId: noteId, targetNoteId: t.id })),
    skipDuplicates: true,
  });
}

export async function saveNote(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const authorId = await requireAdmin();

  const parsed = noteSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    content: formData.get("content"),
    excerpt: formData.get("excerpt") || undefined,
    coverImage: formData.get("coverImage") || undefined,
    stage: formData.get("stage"),
    status: formData.get("status"),
    gated: formData.get("gated") === "on",
    tags: formData.getAll("tags").map(String),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const d = parsed.data;
  const slug = slugify(d.slug || d.title);
  if (!slug) return { error: "Não foi possível gerar o slug." };

  // slug único (exceto a própria nota)
  const clash = await prisma.note.findFirst({
    where: { slug, NOT: d.id ? { id: d.id } : undefined },
    select: { id: true },
  });
  if (clash) return { error: "Já existe uma nota com esse slug." };

  const excerpt = d.excerpt || makeExcerpt(d.content);
  const publishing = d.status === "PUBLISHED";

  const tagConnect = { connect: d.tags.map((slug) => ({ slug })) };

  let noteId: string;
  // Concede +10 $KEY ao autor apenas na 1ª vez que a nota vira publicada.
  let firstPublish = false;
  if (d.id) {
    const current = await prisma.note.findUnique({
      where: { id: d.id },
      select: { publishedAt: true },
    });
    firstPublish = publishing && !current?.publishedAt;
    const note = await prisma.note.update({
      where: { id: d.id },
      data: {
        title: d.title,
        slug,
        content: d.content,
        excerpt,
        coverImage: d.coverImage || null,
        stage: d.stage,
        status: d.status,
        gated: d.gated,
        publishedAt: publishing ? current?.publishedAt ?? new Date() : null,
        tags: { set: [], ...tagConnect },
      },
    });
    noteId = note.id;
  } else {
    firstPublish = publishing;
    const note = await prisma.note.create({
      data: {
        title: d.title,
        slug,
        content: d.content,
        excerpt,
        coverImage: d.coverImage || null,
        stage: d.stage,
        status: d.status,
        gated: d.gated,
        publishedAt: publishing ? new Date() : null,
        authorId,
        tags: tagConnect,
      },
    });
    noteId = note.id;
  }

  await syncBacklinks(noteId, d.content);
  if (firstPublish) await awardKey(authorId, KEY_REWARDS.PUBLISH, "nota publicada");

  revalidatePath("/");
  revalidatePath("/garden");
  revalidatePath(`/notes/${slug}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteNote(id: string) {
  await requireAdmin();
  await prisma.note.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/garden");
  revalidatePath("/admin");
  return { ok: true };
}
