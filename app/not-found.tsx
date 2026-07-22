import Link from "next/link";
import { IconKey } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <IconKey size={56} className="text-rosewood/60" />
      <h1 className="font-display text-5xl text-snow">Porta trancada</h1>
      <p className="max-w-sm font-sans text-fg-soft">
        Essa página não existe — ou ainda não foi plantada. A chave certa está no
        jardim.
      </p>
      <Link
        href="/"
        className="rounded-full bg-rosewood px-5 py-2.5 font-sans text-sm font-medium text-snow transition hover:bg-rosewood-deep"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
