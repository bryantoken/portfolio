"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    start(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("E-mail ou senha incorretos.");
      } else {
        router.push("/");
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-sm space-y-8 pt-6">
      <div className="text-center">
        <Image
          src="/brand/icon-tab.png"
          alt=""
          width={56}
          height={56}
          className="mx-auto mb-4 h-14 w-auto"
        />
        <h1 className="font-display text-3xl text-snow">Entrar</h1>
        <p className="mt-1 font-sans text-sm text-fg-muted">
          Destranque o jardim.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="e-mail"
          autoComplete="email"
          className="w-full rounded-xl border border-surface-3 bg-surface-2 px-4 py-3 font-sans text-sm text-snow outline-none transition placeholder:text-fg-muted focus:border-rosewood/60"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="senha"
          autoComplete="current-password"
          className="w-full rounded-xl border border-surface-3 bg-surface-2 px-4 py-3 font-sans text-sm text-snow outline-none transition placeholder:text-fg-muted focus:border-rosewood/60"
        />
        {error && <p className="font-sans text-xs text-rosewood-soft">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-rosewood py-3 font-sans text-sm font-medium text-snow transition hover:bg-rosewood-deep disabled:opacity-50"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="text-center font-sans text-sm text-fg-muted">
        Ainda não tem conta?{" "}
        <Link href="/register" className="text-rosewood-soft hover:text-rosewood">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
