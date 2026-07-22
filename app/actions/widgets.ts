"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WidgetKind } from "@prisma/client";
import type { FormState } from "@/lib/types";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Acesso restrito ao admin.");
  }
}

const widgetSchema = z
  .object({
    kind: z.nativeEnum(WidgetKind),
    title: z.string().trim().max(80).optional(),
    imageUrl: z.string().trim().max(600).optional(),
    linkUrl: z
      .string()
      .trim()
      .url("Link inválido.")
      .max(600)
      .optional()
      .or(z.literal("")),
    body: z.string().trim().max(6000).optional(),
  })
  .refine(
    (d) =>
      (d.kind === "IMAGE" && !!d.imageUrl) ||
      (d.kind === "LINK" && !!d.linkUrl) ||
      (d.kind === "HTML" && !!d.body),
    { message: "Preencha o conteúdo do bloco." },
  );

export async function createWidget(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = widgetSchema.safeParse({
    kind: formData.get("kind"),
    title: formData.get("title") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    linkUrl: formData.get("linkUrl") || undefined,
    body: formData.get("body") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;

  await prisma.widget.create({
    data: {
      kind: d.kind,
      title: d.title || null,
      imageUrl: d.kind === "IMAGE" ? d.imageUrl || null : null,
      linkUrl: d.linkUrl || null,
      body: d.kind === "HTML" ? d.body || null : null,
    },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteWidget(id: string) {
  await requireAdmin();
  await prisma.widget.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true };
}
