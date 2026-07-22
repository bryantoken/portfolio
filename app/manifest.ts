import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "bryantoken — jardim digital",
    short_name: "bryantoken",
    description:
      "Jardim digital de Bryan Borges — tecnologia, filosofia, religião, autoconhecimento.",
    start_url: "/",
    display: "standalone",
    background_color: "#170312",
    theme_color: "#170312",
    lang: "pt-BR",
    icons: [
      {
        src: "/brand/icon-pwa.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-pwa.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
