import { prisma } from "@/lib/prisma";
import { Stage } from "@prisma/client";

export const STAGE_LABEL: Record<Stage, string> = {
  SEEDLING: "semente",
  BUDDING: "brotando",
  EVERGREEN: "perene",
};

export async function getExistingSlugs(): Promise<Set<string>> {
  const rows = await prisma.note.findMany({ select: { slug: true } });
  return new Set(rows.map((r) => r.slug));
}

export async function getPublishedNotes(tagSlug?: string) {
  return prisma.note.findMany({
    where: {
      status: "PUBLISHED",
      ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    include: {
      tags: true,
      author: { select: { username: true, name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

export async function getNoteBySlug(slug: string) {
  return prisma.note.findUnique({
    where: { slug },
    include: {
      tags: true,
      author: { select: { username: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true, bookmarks: true } },
      incoming: {
        include: {
          source: {
            select: { slug: true, title: true, excerpt: true, status: true },
          },
        },
      },
    },
  });
}
