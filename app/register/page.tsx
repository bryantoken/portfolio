"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/account";
import type { FormState } from "@/lib/types";

const initial: FormState = {};

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerUser, initial);
  const [, startSignIn] = useTransition();
  const [creds, setCreds] = useState<{ email: string; password: string } | null>(null);

  // Após registrar com sucesso, faz login automático.
  useEffect(() => {
    if (state?.ok && creds) {
      startSignIn(async () => {
        await signIn("credentials", { ...creds, redirect: false });
        router.push("/");
        router.refresh();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  return (
    <div className="mx-auto max-w-sm space-y-8 pt-6">
      <div className="text-center">
        <h1 className="font-display text-3xl text-snow">Criar conta</h1>
        <p className="mt-1 font-sans text-sm text-fg-muted">
          Pra dar like, salvar e comentar.
        </p>
      </div>

      <form
        action={formAction}
        onSubmit={(e) => {
          const f = new FormData(e.currentTarget);
          setCreds({
            email: String(f.get("email")),
            password: String(f.get("password")),
          });
        }}
        className="space-y-3"
      >
        <input
          name="email"
          type="email"
          required
          placeholder="e-mail"
          autoComplete="email"
          className="w-full rounded-xl border border-surface-3 bg-surface-2 px-4 py-3 font-sans text-sm text-snow outline-none transition placeholder:text-fg-muted focus:border-rosewood/60"
        />
        <input
          name="username"
          type="text"
          required
          placeholder="usuário"
          autoComplete="username"
          className="w-full rounded-xl border border-surface-3 bg-surface-2 px-4 py-3 font-sans text-sm text-snow outline-none transition placeholder:text-fg-muted focus:border-rosewood/60"
        />
        <input
          name="name"
          type="text"
          placeholder="nome (opcional)"
          autoComplete="name"
          className="w-full rounded-xl border border-surface-3 bg-surface-2 px-4 py-3 font-sans text-sm text-snow outline-none transition placeholder:text-fg-muted focus:border-rosewood/60"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="senha (mín. 8)"
          autoComplete="new-password"
          className="w-full rounded-xl border border-surface-3 bg-surface-2 px-4 py-3 font-sans text-sm text-snow outline-none transition placeholder:text-fg-muted focus:border-rosewood/60"
        />
        {state?.error && (
          <p className="font-sans text-xs text-rosewood-soft">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-rosewood py-3 font-sans text-sm font-medium text-snow transition hover:bg-rosewood-deep disabled:opacity-50"
        >
          {pending ? "Criando…" : "Criar conta"}
        </button>
      </form>

      <p className="text-center font-sans text-sm text-fg-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-rosewood-soft hover:text-rosewood">
          Entrar
        </Link>
      </p>
    </div>
  );
}
