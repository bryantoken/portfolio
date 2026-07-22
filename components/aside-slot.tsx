"use client";

import { usePathname } from "next/navigation";

// Mostra a barra lateral só no desktop (lg+) e a esconde nas telas
// utilitárias (admin, login, registro) onde ela atrapalharia.
export function AsideSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hide =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register";
  if (hide) return null;

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-6">{children}</div>
    </aside>
  );
}
