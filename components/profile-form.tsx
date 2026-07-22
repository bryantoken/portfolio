"use client";

import { useActionState } from "react";
import { signOut } from "next-auth/react";
import { updateProfile } from "@/app/actions/account";
import { IconExit } from "@/components/icons";
import type { FormState } from "@/lib/types";

type Props = {
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

const initial: FormState = {};

export function ProfileForm({ name, bio, avatarUrl }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-3">
        <label className="block font-sans text-[12px] uppercase tracking-wider text-fg-muted">
          Nome
        </label>
        <input
          name="name"
          defaultValue={name ?? ""}
          placeholder="seu nome"
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 font-sans text-sm text-fg outline-none transition placeholder:text-fg-muted focus:border-rosewood/50"
        />

        <label className="block pt-2 font-sans text-[12px] uppercase tracking-wider text-fg-muted">
          Bio
        </label>
        <textarea
          name="bio"
          defaultValue={bio ?? ""}
          rows={3}
          maxLength={280}
          placeholder="uma linha sobre você"
          className="w-full resize-y rounded-xl border border-border bg-surface/60 px-4 py-3 font-sans text-sm text-fg outline-none transition placeholder:text-fg-muted focus:border-rosewood/50"
        />

        <label className="block pt-2 font-sans text-[12px] uppercase tracking-wider text-fg-muted">
          Avatar (URL)
        </label>
        <input
          name="avatarUrl"
          type="url"
          defaultValue={avatarUrl ?? ""}
          placeholder="https://…"
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 font-sans text-sm text-fg outline-none transition placeholder:text-fg-muted focus:border-rosewood/50"
        />

        {state?.error && (
          <p className="font-sans text-xs text-rosewood-soft">{state.error}</p>
        )}
        {state?.ok && (
          <p className="font-sans text-xs text-teal-soft">Perfil atualizado.</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-rosewood px-5 py-2.5 font-sans text-sm font-medium text-snow transition hover:bg-rosewood-deep disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar perfil"}
        </button>
      </form>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex items-center gap-2 font-sans text-sm text-fg-muted transition hover:text-rosewood-soft"
      >
        <IconExit size={16} /> Sair da conta
      </button>
    </div>
  );
}
