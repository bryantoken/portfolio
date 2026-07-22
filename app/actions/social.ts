"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardKey, spendKey, KEY_REWARDS, KEY_COSTS } from "@/lib/key";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Você precisa estar logado.");
  }
  return session.user.id;
}

export async function toggleLike(noteId: string) {
  const userId = await requireUser();
  const [existing, note] = await Promise.all([
    prisma.like.findUnique({ where: { userId_noteId: { userId, noteId } } }),
    prisma.note.findUnique({
      where: { id: noteId },
      select: { slug: true, authorId: true },
    }),
  ]);
  if (!note) throw new Error("Nota não encontrada.");

  // O autor ganha (ou perde, ao descurtir) $KEY — nunca por auto-curtida.
  const rewardsAuthor = note.authorId !== userId;

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    if (rewardsAuthor)
      await awardKey(note.authorId, -KEY_REWARDS.LIKE_RECEIVED, "curtida removida");
  } else {
    await prisma.like.create({ data: { userId, noteId } });
    if (rewardsAuthor)
      await awardKey(note.authorId, KEY_REWARDS.LIKE_RECEIVED, "curtida recebida");
  }

  revalidatePath(`/notes/${note.slug}`);
  return { liked: !existing };
}

export async function toggleBookmark(noteId: string) {
  const userId = await requireUser();
  const existing = await prisma.bookmark.findUnique({
    where: { userId_noteId: { userId, noteId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({ data: { userId, noteId } });
  }

  revalidatePath("/saved");
  return { bookmarked: !existing };
}

const commentSchema = z.object({
  noteId: z.string().min(1),
  body: z.string().trim().min(1, "Escreva algo.").max(2000),
  parentId: z.string().optional(),
});

export async function addComment(input: z.infer<typeof commentSchema>) {
  const userId = await requireUser();
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Comentário inválido." };
  }

  const { noteId, body, parentId } = parsed.data;
  await prisma.comment.create({
    data: { userId, noteId, body, parentId: parentId || null },
  });

  // Quem comenta ganha $KEY.
  await awardKey(userId, KEY_REWARDS.COMMENT, "comentário publicado");

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { slug: true },
  });
  if (note) revalidatePath(`/notes/${note.slug}`);
  return { ok: true };
}

/** Apoia (tip) o autor de uma nota: transfere $KEY do leitor para o autor. */
export async function tipAuthor(noteId: string) {
  const userId = await requireUser();
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { slug: true, authorId: true },
  });
  if (!note) return { error: "Nota não encontrada." };
  if (note.authorId === userId) return { error: "Você não pode apoiar a si mesmo." };

  try {
    await prisma.$transaction(async (tx) => {
      await spendKey(userId, KEY_COSTS.TIP, "apoio enviado", tx);
      await awardKey(note.authorId, KEY_COSTS.TIP, "apoio recebido", tx);
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não foi possível apoiar." };
  }

  revalidatePath(`/notes/${note.slug}`);
  revalidatePath("/profile");
  return { ok: true };
}

/** Desbloqueia uma nota trancada gastando $KEY (idempotente). */
export async function unlockNote(noteId: string) {
  const userId = await requireUser();
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { slug: true, gated: true, authorId: true },
  });
  if (!note) return { error: "Nota não encontrada." };
  if (!note.gated || note.authorId === userId) return { ok: true };

  const already = await prisma.unlock.findUnique({
    where: { userId_noteId: { userId, noteId } },
  });
  if (already) return { ok: true };

  try {
    await prisma.$transaction(async (tx) => {
      await spendKey(userId, KEY_COSTS.UNLOCK, "nota desbloqueada", tx);
      await tx.unlock.create({ data: { userId, noteId } });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não foi possível desbloquear." };
  }

  revalidatePath(`/notes/${note.slug}`);
  revalidatePath("/profile");
  return { ok: true };
}
