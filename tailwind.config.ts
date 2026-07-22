import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base palette (palette.txt)
        rosewood: {
          DEFAULT: "#cf2457",
          soft: "#e04b74",
          deep: "#a11742",
        },
        teal: {
          DEFAULT: "#2176ae",
          soft: "#4a97cb",
          deep: "#155a86",
        },
        bean: "#170312", // coffee bean — fundo principal
        snow: "#fffbff",
        ink: "#001524", // ink black — superfícies escuras alternativas

        // Semantic surfaces (derivadas do coffee bean)
        surface: "#1e0819",
        "surface-2": "#2a0f24",
        "surface-3": "#371530",
        border: "#3a1830",
        "border-soft": "#2a0f24",

        // Foreground
        fg: "#f7ecf3",
        "fg-soft": "#c9a9bc",
        "fg-muted": "#8a6478",
      },
      fontFamily: {
        // Escrita / títulos — serifada, com acentos e números completos.
        // (Bandito "Demo" não tem acentos nem dígitos; ver --font-bandito no CSS.)
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Palatino",
          "Book Antiqua",
          "Georgia",
          "Cambria",
          "serif",
        ],
        sans: [
          "var(--font-courbe)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        float: "0 8px 40px -8px rgba(0,0,0,0.7), 0 2px 12px -4px rgba(207,36,87,0.15)",
        glow: "0 0 24px -4px rgba(207,36,87,0.4)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) backwards",
        "pulse-dot": "pulseDot 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
