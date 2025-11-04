// src/components/OptimizedImage.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff, Loader2 } from 'lucide-react';
import { isValidImageUrl, normalizeImageUrl } from '@/lib/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  showLoader?: boolean;
  fallbackComponent?: React.ReactNode;
}

/**
 * Componente de imagem otimizada com tratamento de erros e loading state
 * Ideal para imagens do bucket Minio
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  quality = 85,
  showLoader = true,
  fallbackComponent,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    console.error('❌ Erro ao carregar imagem:', src);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Normaliza e valida a URL
  const normalizedSrc = normalizeImageUrl(src);
  const isValid = isValidImageUrl(normalizedSrc);

  if (!isValid || imageError) {
    return (
      fallbackComponent || (
        <div className="flex flex-col items-center justify-center w-full h-full bg-linear-to-br from-slate-50 to-slate-100">
          <div className="w-16 h-16 mb-3 rounded-full bg-slate-200/80 flex items-center justify-center shadow-sm">
            <ImageOff className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500 px-4 text-center">
            Imagem não disponível
          </p>
        </div>
      )
    );
  }

  return (
    <div className="relative w-full h-full">
      {imageLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 z-10">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      )}
      <Image
        src={normalizedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        quality={quality}
        unoptimized={false}
      />
    </div>
  );
}
