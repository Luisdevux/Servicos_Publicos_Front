import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para Docker - Otimiza tamanho da imagem
  output: "standalone",
  
  // Hot reload para Docker no Windows
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Verifica mudanças a cada 1 segundo
        aggregateTimeout: 300, // Aguarda 300ms após mudança
        ignored: ['**/node_modules', '**/.next'],
      };
    }
    return config;
  },
  
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
        hostname: 'api',
        port: '5011',
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
