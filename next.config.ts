import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para Docker - Otimiza tamanho da imagem
  output: "standalone",
  
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
        protocol: 'http',
        hostname: 'localhost',
        port: '5011',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'api',
        port: '5011',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'objects.fslab.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Configurações para otimização de imagens
    formats: ['image/webp', 'image/avif'],
    qualities: [75, 85, 90, 95, 100],
    // Permitir blob URLs para preview de imagens
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configurar timeout para downloads de imagens remotas
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
