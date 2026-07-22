// $KEY — token utilitário/reputação OFF-CHAIN da plataforma.
// Não é dinheiro real, não há câmbio, saque nem promessa de retorno.
// É uma "chave do conhecimento": ganha-se escrevendo/engajando e
// gasta-se para apoiar autores, desbloquear notas e comprar cosméticos.
//
// Regra de ouro: toda mudança de saldo passa por awardKey/spendKey,
// que gravam no KeyLedger E ajustam User.keyBalance na MESMA transação,
// para que saldo e livro-razão nunca divirjam.
import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

/** Client comum ou client dentro de um $transaction. */
type Db = PrismaClient | Prisma.TransactionClient;

/** Recompensas por engajamento (crédito). */
export const KEY_REWARDS = {
  PUBLISH: 10, // publicar uma nota (autor)
  LIKE_RECEIVED: 2, // receber uma curtida (autor)
  COMMENT: 1, // comentar (quem comenta)
} as const;

/** Custos de utilidade (débito). */
export const KEY_COSTS = {
  TIP: 5, // apoiar um autor
  UNLOCK: 20, // desbloquear uma nota trancada
  SEAL: 50, // comprar o selo do Guardião
} as const;

/**
 * Credita (ou debita, se delta < 0) $KEY: grava a linha no razão e
 * ajusta o saldo do usuário na mesma unidade de trabalho.
 * Passe `db` (client de transação) para compor com outras escritas.
 */
export async function awardKey(
  userId: string,
  delta: number,
  reason: string,
  db: Db = prisma,
) {
  if (delta === 0) return;
  await db.keyLedger.create({ data: { userId, delta, reason } });
  await db.user.update({
    where: { id: userId },
    data: { keyBalance: { increment: delta } },
  });
}

/**
 * Debita `amount` (> 0) de $KEY, validando saldo suficiente ANTES.
 * Lança se o usuário não tiver chaves bastante. Use dentro de um
 * $transaction quando o gasto libera algo (unlock/tip/seal).
 */
export async function spendKey(
  userId: string,
  amount: number,
  reason: string,
  db: Db = prisma,
) {
  if (amount <= 0) throw new Error("Valor inválido.");
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { keyBalance: true },
  });
  if (!user) throw new Error("Usuário não encontrado.");
  if (user.keyBalance < amount) {
    throw new Error("Chaves insuficientes.");
  }
  await awardKey(userId, -amount, reason, db);
}
