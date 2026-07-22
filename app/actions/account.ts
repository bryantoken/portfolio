"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/markdown";
import { spendKey, KEY_COSTS } from "@/lib/key";
import type { FormState } from "@/lib/types";

const registerSchema = z.object({
  email: z.string().email("E-mail inválido."),
  username: z
    .string()
    .trim()
    .min(3, "Usuário: mín. 3 caracteres.")
    .max(24)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Use letras, números, . _ -"),
  name: z.string().trim().max(60).optional(),
  password: z.string().min(8, "Senha: mín. 8 caracteres."),
});

export async function registerUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    name: formData.get("name") || undefined,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const email = parsed.data.email.toLowerCase();
  const username = slugify(parsed.data.username) || parsed.data.username.toLowerCase();

  const clash = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true },
  });
  if (clash) {
    return { error: "E-mail ou usuário já cadastrado." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email,
      username,
      name: parsed.data.name || null,
      passwordHash,
      role: "MEMBER",
    },
  });

  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(280).optional(),
  avatarUrl: z.string().url("URL inválida.").optional().or(z.literal("")),
});

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name") || undefined,
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name || null,
      bio: parsed.data.bio || null,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  revalidatePath("/profile");
  return { ok: true };
}

/** Compra o selo do Guardião gastando $KEY (cosmético, uma única vez). */
export async function buySeal(): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." };
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { seal: true },
  });
  if (user?.seal) return { error: "Você já possui o selo." };

  try {
    await prisma.$transaction(async (tx) => {
      await spendKey(userId, KEY_COSTS.SEAL, "selo do guardião", tx);
      await tx.user.update({ where: { id: userId }, data: { seal: "guardiao" } });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não foi possível comprar." };
  }

  revalidatePath("/profile");
  return { ok: true };
}
