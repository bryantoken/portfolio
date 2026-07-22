"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLike, toggleBookmark, tipAuthor } from "@/app/actions/social";
import { IconHeart, IconSeal, IconShare, IconQuill, IconToken } from "@/components/icons";

type Props = {
  noteId: string;
  title: string;
  isAuthed: boolean;
  initialLiked: boolean;
  likeCount: number;
  initialBookmarked: boolean;
  commentCount: number;
  canTip?: boolean;
  tipCost?: number;
};

export function SocialBar({
  noteId,
  title,
  isAuthed,
  initialLiked,
  likeCount,
  initialBookmarked,
  commentCount,
  canTip = false,
  tipCost = 5,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(likeCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [shared, setShared] = useState(false);
  const [tipMsg, setTipMsg] = useState<string | null>(null);

  function guard() {
    if (!isAuthed) {
      router.push("/login");
      return false;
    }
    return true;
  }

  function onLike() {
    if (!guard()) return;
    setLiked((v) => !v);
    setLikes((n) => n + (liked ? -1 : 1));
    start(async () => {
      await toggleLike(noteId);
    });
  }

  function onBookmark() {
    if (!guard()) return;
    setBookmarked((v) => !v);
    start(async () => {
      await toggleBookmark(noteId);
    });
  }

  async function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelado */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      /* noop */
    }
  }

  function onTip() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    setTipMsg(null);
    start(async () => {
      const res = await tipAuthor(noteId);
      if (res?.error) setTipMsg(res.error);
      else {
        setTipMsg("Apoiado! ♦");
        router.refresh();
        setTimeout(() => setTipMsg(null), 2200);
      }
    });
  }

  const btn =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-sm transition disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        onClick={onLike}
        disabled={pending}
        aria-pressed={liked}
        className={`${btn} ${
          liked
            ? "border-rosewood/60 bg-rosewood/15 text-rosewood-soft"
            : "border-border text-fg-soft hover:border-rosewood/40 hover:text-fg"
        }`}
      >
        <IconHeart size={17} filled={liked} /> {likes}
      </button>

      <a
        href="#comentarios"
        className={`${btn} border-border text-fg-soft hover:border-teal/40 hover:text-fg`}
      >
        <IconQuill size={17} /> {commentCount}
      </a>

      <button
        onClick={onBookmark}
        disabled={pending}
        aria-pressed={bookmarked}
        className={`${btn} ${
          bookmarked
            ? "border-teal/60 bg-teal/15 text-teal-soft"
            : "border-border text-fg-soft hover:border-teal/40 hover:text-fg"
        }`}
      >
        <IconSeal size={17} /> {bookmarked ? "Salvo" : "Salvar"}
      </button>

      <button
        onClick={onShare}
        className={`${btn} border-border text-fg-soft hover:border-rosewood/40 hover:text-fg`}
      >
        <IconShare size={17} /> {shared ? "Copiado!" : "Compartilhar"}
      </button>

      {canTip && (
        <button
          onClick={onTip}
          disabled={pending}
          title="Apoiar o autor com $KEY"
          className={`${btn} border-rosewood/40 text-rosewood-soft hover:border-rosewood/70 hover:bg-rosewood/10`}
        >
          <IconToken size={17} /> {tipMsg ?? `Apoiar (−${tipCost} $KEY)`}
        </button>
      )}
    </div>
  );
}
