import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { WidgetManager } from "@/components/widget-manager";

export const metadata: Metadata = { title: "Barra lateral" };

export default async function AdminWidgetsPage() {
  const widgets = await prisma.widget.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6 pt-4">
      <Link
        href="/admin"
        className="font-sans text-[12px] text-fg-muted transition hover:text-fg-soft"
      >
        ← escrivaninha
      </Link>
      <div>
        <h1 className="font-display text-3xl text-snow">Barra lateral</h1>
        <p className="mt-1 font-sans text-sm text-fg-muted">
          Blocos que aparecem à direita no desktop — imagens, gifs, links,
          embeds. Coisas da era de ouro da web.
        </p>
      </div>
      <WidgetManager widgets={widgets} />
    </div>
  );
}
