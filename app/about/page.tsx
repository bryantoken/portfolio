import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Bryan Borges — BI Analyst e construtor. Dados financeiros, Rust, Ruby, Python. Vila Velha, ES.",
};

const projects = [
  {
    name: "Split",
    year: "2025",
    status: "building",
    href: null,
    desc: "Plataforma de gestão de comissões para corretoras de investimento. Versionamento temporal de regras, ingestão de CSV brasileiro, splits paramétricos por time.",
    stack: "Rust · Axum · PostgreSQL · Next.js",
  },
  {
    name: "Hydra Trader Bot",
    year: "2024",
    status: "live",
    href: "https://beholderhydra.com.br",
    desc: "Bot de trading cripto multi-timeframe sobre Binance. Setup de 10 condições combinando ADX, RSI estocástico e overlap de sessões Asian/London — calibrado pra horários brasileiros.",
    stack: "Node.js · Binance API · React · WebSocket",
  },
  {
    name: "Takedone",
    year: "2026",
    status: "live",
    href: "https://www.takedone.com",
    desc: "SaaS corporativo pra gestão de demandas entre áreas. Cada empresa monta seu workspace com regras próprias — gestores atribuem, executores cumprem, o sistema audita eficiência.",
    stack: "React · Vite · TypeScript · Node.js",
  },
  {
    name: "Fusion Beef",
    year: "2025",
    status: "live",
    href: "https://fusionbeef.com.br",
    desc: "E-commerce de carnes premium em Rails 8 com checkout Stripe, OAuth Google e scraper Selenium da Minerva Foods. Deploy via Kamal 2 em Digital Ocean.",
    stack: "Rails 8 · MySQL · Tailwind · Stripe · Kamal",
  },
];

const stack: [string, string][] = [
  ["Linguagens", "Python · Ruby · Rust · TypeScript · JavaScript · SQL"],
  ["Runtime", "Node.js · Axum · Rails · Django · Next.js · React"],
  ["Dados", "pandas · Power BI · DAX · PostgreSQL · SQL Server"],
  ["Infra", "Docker · Kamal · GitHub Actions · Tailscale · Debian"],
  ["Por curiosidade", "Fortran (.f90) · Elixir · sistemas distribuídos · design"],
];

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.2em] text-fg-muted">
      <span>{n}</span>
      <span className="section-rule" />
      <span>{children}</span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-24 pt-4">
      {/* Hero */}
      <header className="animate-fade-up">
        <SectionLabel n="001">Quem escreve</SectionLabel>
        <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-snow sm:text-6xl md:text-7xl">
          Bryan Borges,
          <br />
          <span className="text-rosewood">no lado curioso</span>
          <br />
          do código.
        </h1>
        <div className="mt-8 flex items-center gap-3 font-sans text-sm">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-rosewood" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rosewood" />
          </span>
          <span className="text-fg-soft">construindo agora</span>
          <span className="text-fg">Split</span>
        </div>
        <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-fg-soft">
          BI Analyst na <span className="text-fg">Golden Investimentos</span> —
          pipelines de dados em Python, dashboards em Power BI e sistemas
          financeiros em Rust. Bots de trading nas madrugadas e Fortran por
          curiosidade. Crypto, Ruby &amp; Python. NodeJS também —{" "}
          <span className="italic">I admit it.</span>
        </p>
      </header>

      {/* Na mesa agora */}
      <section className="animate-fade-up">
        <SectionLabel n="002">Na mesa agora</SectionLabel>
        <div className="space-y-5">
          {[
            ["Split", "sistema de gestão de comissões em Rust + Axum + Next.js, substituindo a infra legada da Golden."],
            ["Hydra Trader Bot", "bot de trading cripto multi-timeframe com setup de 10 condições (ADX, RSI estocástico, overlap de sessões)."],
            ["Prisma", "sistema dual de BI e CRM em Node.js, integrando dados financeiros com relacionamento de cliente."],
          ].map(([name, desc]) => (
            <div key={name} className="flex items-baseline gap-4">
              <span className="translate-y-px font-sans text-xs text-rosewood">→</span>
              <p className="font-sans text-base leading-relaxed text-fg-soft">
                <span className="font-medium text-fg">{name}</span> — {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section className="animate-fade-up">
        <SectionLabel n="003">Stack</SectionLabel>
        <dl className="grid grid-cols-[110px_1fr] gap-x-8 gap-y-6 font-sans text-[15px] md:grid-cols-[150px_1fr]">
          {stack.map(([term, def]) => (
            <div key={term} className="contents">
              <dt className="pt-1 font-sans text-[11px] uppercase tracking-[0.15em] text-fg-muted">
                {term}
              </dt>
              <dd className="leading-relaxed text-fg-soft">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Trabalhos */}
      <section className="animate-fade-up">
        <SectionLabel n="004">Trabalhos selecionados</SectionLabel>
        <div className="space-y-12">
          {projects.map((p) => (
            <article key={p.name} className="group">
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl italic text-fg transition-colors group-hover:text-rosewood-soft md:text-3xl">
                  {p.href ? (
                    <a href={p.href} target="_blank" rel="noopener" className="inline-flex items-baseline gap-2">
                      {p.name}
                      <span className="text-[12px] opacity-50">↗</span>
                    </a>
                  ) : (
                    p.name
                  )}
                </h3>
                <span className="shrink-0 whitespace-nowrap font-sans text-[11px] uppercase tracking-wider text-fg-muted">
                  {p.year} · <span className="text-rosewood">{p.status}</span>
                </span>
              </div>
              <p className="mb-3 max-w-2xl font-sans leading-relaxed text-fg-soft">
                {p.desc}
              </p>
              <p className="font-sans text-[11px] uppercase tracking-wider text-fg-muted">
                {p.stack}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Contato */}
      <footer className="animate-fade-up border-t border-border-soft pt-12">
        <SectionLabel n="005">Pra conversar</SectionLabel>
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
          {[
            ["Email", "bryanzborges1@gmail.com", "mailto:bryanzborges1@gmail.com"],
            ["LinkedIn", "in/bryanzucoborges", "https://linkedin.com/in/bryanzucoborges"],
            ["GitHub", "@bryantoken", "https://github.com/bryantoken"],
            ["Localização", "Vila Velha, ES — Brasil", null],
          ].map(([label, value, href]) => (
            <div key={label as string}>
              <div className="mb-2 font-sans text-[11px] uppercase tracking-[0.15em] text-fg-muted">
                {label}
              </div>
              {href ? (
                <a
                  href={href as string}
                  target={String(href).startsWith("http") ? "_blank" : undefined}
                  rel="noopener"
                  className="font-sans text-[15px] text-fg transition hover:text-rosewood"
                >
                  {value}
                </a>
              ) : (
                <span className="font-sans text-[15px] text-fg">{value}</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-14 font-sans text-[11px] uppercase tracking-[0.15em] text-fg-muted">
          © 2026 Bryan Borges ·{" "}
          <span className="normal-case italic tracking-normal">
            feito em Vila Velha com café demais
          </span>
        </p>
      </footer>
    </div>
  );
}
