import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Gate server-side: só o admin passa. Defesa em profundidade —
// cada server action de nota também revalida o papel.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  return <>{children}</>;
}
