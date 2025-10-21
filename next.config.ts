import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permitir imagens externas se necessário
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Configurações para otimização de imagens
    formats: ['image/webp', 'image/avif'],
    // Permitir blob URLs para preview de imagens
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
