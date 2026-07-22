import { PrismaClient, Role, NoteStatus, Stage } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TOPICS = [
  { slug: "tecnologia", name: "Tecnologia" },
  { slug: "religiao", name: "Religião" },
  { slug: "filosofia", name: "Filosofia" },
  { slug: "empreendedorismo", name: "Empreendedorismo" },
  { slug: "autoconhecimento", name: "Autoconhecimento" },
  { slug: "ideias", name: "Ideias" },
  { slug: "insights", name: "Insights" },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "bryanzborges1@gmail.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "troque-esta-senha";
  const username = process.env.ADMIN_USERNAME ?? "bryan";
  const name = process.env.ADMIN_NAME ?? "Bryan Borges";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, passwordHash, name, username },
    create: {
      email,
      username,
      name,
      passwordHash,
      role: Role.ADMIN,
      bio: "Registrando a evolução — nada aqui é verdade absoluta.",
    },
  });
  console.log(`✔ admin: ${admin.email}`);

  const tags = new Map<string, string>();
  for (const t of TOPICS) {
    const tag = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: t,
    });
    tags.set(t.slug, tag.id);
  }
  console.log(`✔ ${tags.size} tópicos`);

  // ── Notas de exemplo (demonstram wiki-links + backlinks) ──────
  const note1 = await prisma.note.upsert({
    where: { slug: "por-que-um-jardim-digital" },
    update: {},
    create: {
      slug: "por-que-um-jardim-digital",
      title: "Por que um jardim digital",
      excerpt:
        "Não é um blog. É um lugar pra plantar ideias meio prontas e voltar pra regá-las.",
      status: NoteStatus.PUBLISHED,
      stage: Stage.EVERGREEN,
      publishedAt: new Date(),
      authorId: admin.id,
      tags: { connect: [{ slug: "ideias" }, { slug: "filosofia" }] },
      content: `Um blog é cronológico e definitivo. Um **jardim digital** é o contrário: não-linear, sempre inacabado, honesto sobre a dúvida.

Aqui eu ==marco a minha evolução==. O que eu penso hoje pode envelhecer mal — e tudo bem. Nada aqui é pra ser tomado como verdade.

> "A dúvida não é um estado agradável, mas a certeza é um estado absurdo."

Cada nota tem um **estágio de crescimento**:

- *semente* — ideia bruta, recém-plantada
- *brotando* — em desenvolvimento
- *perene* — madura, revisada várias vezes

Veja também: [[a-chave-do-conhecimento|a chave do conhecimento]].`,
    },
  });

  const note2 = await prisma.note.upsert({
    where: { slug: "a-chave-do-conhecimento" },
    update: {},
    create: {
      slug: "a-chave-do-conhecimento",
      title: "A chave do conhecimento",
      excerpt:
        "Conhecimento não é acúmulo — é a chave que abre a próxima porta, e depois é descartada.",
      status: NoteStatus.PUBLISHED,
      stage: Stage.BUDDING,
      publishedAt: new Date(),
      authorId: admin.id,
      tags: { connect: [{ slug: "autoconhecimento" }, { slug: "tecnologia" }] },
      content: `A chave da marca não é decoração. É a tese: **conhecimento abre portas e depois se torna obsoleto**.

O que aprendi em [[por-que-um-jardim-digital|por que um jardim digital]] vale aqui — registrar é mais importante que estar certo.

*Escrever é pensar duas vezes.*`,
    },
  });

  // Backlink derivado dos [[...]]
  await prisma.backlink.upsert({
    where: {
      sourceNoteId_targetNoteId: {
        sourceNoteId: note1.id,
        targetNoteId: note2.id,
      },
    },
    update: {},
    create: { sourceNoteId: note1.id, targetNoteId: note2.id },
  });
  await prisma.backlink.upsert({
    where: {
      sourceNoteId_targetNoteId: {
        sourceNoteId: note2.id,
        targetNoteId: note1.id,
      },
    },
    update: {},
    create: { sourceNoteId: note2.id, targetNoteId: note1.id },
  });
  console.log("✔ 2 notas de exemplo + backlinks");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
