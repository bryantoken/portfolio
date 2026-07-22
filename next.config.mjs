/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // next/image só é usado com imagens locais (/brand). Imagens de admin/usuário
  // usam <img> comum e não passam pelo otimizador — por isso NÃO abrimos
  // remotePatterns (evita SSRF/DoS via Image Optimization em host público).
};

export default nextConfig;
