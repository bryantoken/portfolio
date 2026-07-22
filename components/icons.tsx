// Ícones temáticos medievais — line style, sem emoji.
// Herdam a cor via `currentColor` e o tamanho via prop `size`.
import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 22, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

/** Chave ornamentada — símbolo da marca / home */
export function IconKey(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="7.5" cy="7.5" r="3.2" />
      <circle cx="6" cy="6" r="0.6" fill="currentColor" stroke="none" />
      <path d="M9.8 9.8 L18 18" />
      <path d="M18 18 l2.5 -2.5" />
      <path d="M15.5 15.5 l1.6 1.6" />
      <path d="M17 20 l1.5 -1.5" />
    </svg>
  );
}

/** Pergaminho — jardim / notas */
export function IconScroll(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 4h9a2 2 0 0 1 2 2v11" />
      <path d="M17 17a2 2 0 0 0 2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2h3" />
      <path d="M9.5 8.5h4M9.5 12h4" />
    </svg>
  );
}

/** Lupa ornamentada — busca */
export function IconLoupe(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="10.5" cy="10.5" r="6" />
      <circle cx="10.5" cy="10.5" r="2.6" />
      <path d="M15 15l5 5" />
    </svg>
  );
}

/** Selo/marcador — salvos (bookmark) */
export function IconSeal(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 3h12v18l-6-4-6 4z" />
      <circle cx="12" cy="9" r="2.2" />
    </svg>
  );
}

/** Brasão/escudo — perfil */
export function IconShield(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M8.5 15.5c1-1.4 2.1-2 3.5-2s2.5.6 3.5 2" />
    </svg>
  );
}

/** Coração heráldico — like */
export function IconHeart({ filled, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(p)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20s-6.5-4.3-8.5-8.2C2 8.5 3.4 5.5 6.3 5.5c1.9 0 3 1.1 3.7 2.2.7-1.1 1.8-2.2 3.7-2.2 2.9 0 4.3 3 2.8 6.3C18.5 15.7 12 20 12 20z" />
    </svg>
  );
}

/** Pena de escrever — comentar / escrever */
export function IconQuill(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 20c6-1 9-3 12-8 2-3 3-6 4-9-4 1-8 2-11 5-3 3-4 7-5 12z" />
      <path d="M6.5 17.5c3-.5 5-2 6.5-4" />
      <path d="M4 20l2-2" />
    </svg>
  );
}

/** Setas de brasão — compartilhar */
export function IconShare(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="17" cy="6" r="2.4" />
      <circle cx="17" cy="18" r="2.4" />
      <path d="M8.2 10.9 14.8 7.1M8.2 13.1 14.8 16.9" />
    </svg>
  );
}

/** Torre / castelo — sobre / portfólio */
export function IconTower(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 21V9l2-1 2 1V6l3-2 3 2v3l2-1 2 1v12z" />
      <path d="M10 21v-4h4v4" />
      <path d="M9 12h.01M15 12h.01" />
    </svg>
  );
}

/** Bússola — descoberta / now */
export function IconCompass(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
      <circle cx="12" cy="12" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Livro aberto — leituras / ensaios */
export function IconBook(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 6C10 4.5 7.5 4 4 4.5V18c3.5-.5 6 0 8 1.5 2-1.5 4.5-2 8-1.5V4.5C16.5 4 14 4.5 12 6z" />
      <path d="M12 6v13.5" />
    </svg>
  );
}

/** Tocha — ideias / insights */
export function IconTorch(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3c1.8 1.6 2.6 3.2 2.6 4.8A2.6 2.6 0 0 1 12 10.4a2.6 2.6 0 0 1-2.6-2.6C9.4 6.2 10.2 4.6 12 3z" />
      <path d="M10.4 10.4 9 21h6l-1.4-10.6" />
      <path d="M9.4 17h5.2" />
    </svg>
  );
}

/** Moeda com chave — token $KEY */
export function IconToken(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="10.5" cy="10.5" r="2.2" />
      <path d="M12 12l3.5 3.5M14 14l1.2-1.2M15.5 15.5l1-1" />
    </svg>
  );
}

/** Sair */
export function IconExit(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <path d="M18 15l3-3-3-3M9 12h12" />
    </svg>
  );
}
