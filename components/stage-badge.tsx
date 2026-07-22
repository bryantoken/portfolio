import { Stage } from "@prisma/client";
import { STAGE_LABEL } from "@/lib/notes";

const STYLES: Record<Stage, string> = {
  SEEDLING: "text-teal-soft border-teal/30 bg-teal/10",
  BUDDING: "text-rosewood-soft border-rosewood/30 bg-rosewood/10",
  EVERGREEN: "text-emerald-300 border-emerald-400/25 bg-emerald-400/10",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${STYLES[stage]}`}
    >
      <span className="inline-block h-1.5 w-1.5 rotate-45 bg-current" />
      {STAGE_LABEL[stage]}
    </span>
  );
}
