# bryantoken

Jardim digital / plataforma IndieWeb de Bryan Borges — tecnologia, religião,
filosofia, empreendedorismo e autoconhecimento. Notas crescem como plantas
(semente → brotando → perene), com wiki-links `[[slug]]`, backlinks, curtidas,
salvos, comentários aninhados e o token utilitário **$KEY**. Nada aqui é verdade
absoluta — é um registro de evolução.

## Stack

- **Next.js 15** (App Router, React 19, Server Actions)
- **PostgreSQL** + **Prisma 6**
- **Auth.js v5** (NextAuth) — credenciais, sessão JWT
- **Tailwind CSS 3**
- Renderização de markdown com `react-markdown` + `remark-gfm`

## Rodando localmente

Pré-requisitos: Node 20+ e um Postgres acessível.

```bash
cp .env.example .env      # preencha DATABASE_URL, AUTH_SECRET, ADMIN_*
npm install
npm run db:migrate        # aplica as migrations (cria o schema)
npm run db:seed           # cria o admin + tópicos + notas de exemplo
npm run dev               # http://localhost:3000
```

Scripts úteis: `db:studio` (Prisma Studio), `db:deploy` (aplica migrations sem
gerar novas), `build`, `start`.

## Deploy (Railway)

1. **Novo projeto** a partir deste repositório (GitHub).
2. Adicione o **plugin PostgreSQL** ao projeto.
3. No serviço da app, configure as **variáveis de ambiente**:
   - `DATABASE_URL` → `${{ Postgres.DATABASE_URL }}` (referência ao plugin)
   - `AUTH_SECRET` → gere com `npx auth secret`
   - `AUTH_TRUST_HOST` → `true`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (senha forte), `ADMIN_USERNAME`, `ADMIN_NAME`
   - `SITE_URL` → a URL pública do serviço
4. O **build** roda `prisma generate && next build`; o **start** roda
   `prisma migrate deploy && next start` — ou seja, as migrations são aplicadas
   automaticamente a cada release.
5. Após o primeiro deploy, semeie o admin **uma vez**:
   `railway run npm run db:seed`.

### Uploads da barra lateral

O admin pode subir imagens/gifs (barra lateral) em `/public/uploads`. O sistema
de arquivos do Railway é **efêmero** — para persistir os uploads entre deploys,
monte um **Volume** do Railway apontando para `/app/public/uploads`. (Alternativa
futura: storage externo tipo S3/Cloudinary.)

## Licença

Projeto pessoal. As fontes de exibição (Bandito, Courbe Sans) têm licença
própria e não são redistribuídas neste repositório.
