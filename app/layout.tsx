import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { BottomBar } from "@/components/bottom-bar";
import { AsideSlot } from "@/components/aside-slot";
import { Sidebar } from "@/components/sidebar";
import { auth } from "@/lib/auth";

// Courbe Sans — fonte de interface (tem acentos e dígitos completos).
const courbe = localFont({
  src: "../public/fonts/CourbeSans.ttf",
  variable: "--font-courbe",
  display: "swap",
});

// Nota: a fonte de escrita/títulos usa uma pilha serifada (ver tailwind
// `display`). O Bandito "Demo" não possui acentos nem números, então não é
// usado em texto. Para reativá-lo (versão completa), carregue-o aqui como
// `--font-display` e prefixe a pilha `display` com essa variável.

export const metadata: Metadata = {
  metadataBase: new URL("https://bryantoken.com"),
  title: {
    default: "bryantoken — jardim digital de Bryan Borges",
    template: "%s — bryantoken",
  },
  description:
    "Um jardim digital: tecnologia, religião, filosofia, empreendedorismo e autoconhecimento. Registro minha evolução — nada aqui é verdade absoluta.",
  applicationName: "bryantoken",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/brand/icon-tab.png",
    apple: "/brand/icon-pwa.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "bryantoken",
  },
  openGraph: {
    type: "website",
    siteName: "bryantoken",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#170312",
  width: "device-width",
  initialScale: 1,
};

// App é dependente de sessão + banco: renderização dinâmica em toda árvore
// (evita acesso ao DB durante o build e mantém sessão/likes sempre atuais).
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="pt-BR" className={courbe.variable}>
      <body className="font-sans grain min-h-dvh">
        <div className="ambient" />
        <Providers session={session}>
          <SiteHeader session={session} />
          <div className="relative z-10 mx-auto flex w-full max-w-3xl justify-center gap-8 px-5 pb-32 pt-6 md:px-8 md:pb-24 md:pt-10 lg:max-w-6xl">
            <main className="w-full min-w-0 lg:max-w-3xl">{children}</main>
            <AsideSlot>
              <Sidebar />
            </AsideSlot>
          </div>
          <BottomBar session={session} />
        </Providers>
      </body>
    </html>
  );
}
