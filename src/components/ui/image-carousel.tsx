"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageFullscreenViewer } from "./image-fullscreen-viewer";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function ImageCarousel({ images, alt = "Imagem", className }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    const imagensValidas = images?.filter((img) => img && img.trim() !== '') || [];
    setCurrentIndex((prev) => (prev + 1) % imagensValidas.length);
    setIsLoading(true);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    const imagensValidas = images?.filter((img) => img && img.trim() !== '') || [];
    setCurrentIndex((prev) => (prev - 1 + imagensValidas.length) % imagensValidas.length);
    setIsLoading(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleImageClick = () => {
    setIsFullscreenOpen(true);
  };

  // Filtrar imagens vazias ou inválidas
  const imagensValidas = images?.filter((img) => img && img.trim() !== '') || [];
  
  if (imagensValidas.length === 0) return null;

  const zoomScale = isHovering ? 2 : 1;
  const currentImage = imagensValidas[currentIndex] || imagensValidas[0];

  return (
    <>
      <div 
        className={cn("relative w-full h-80 rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center", className)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {currentImage && (
          <Image
            src={currentImage}
            alt={`${alt} ${currentIndex + 1}`}
            fill
            className="object-contain cursor-pointer"
            style={{ 
              transform: `scale(${zoomScale})`,
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
              transition: isHovering ? 'transform-origin 0.1s ease-out' : 'transform 0.3s ease-out, transform-origin 0.3s ease-out'
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setIsLoading(false)}
            onClick={handleImageClick}
          />
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <Loader2 className="animate-spin text-white" size={36} />
          </div>
        )}
        
        {imagensValidas.length > 1 && (
          <>
            <button
              onClick={(e) => prevImage(e)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
              aria-label="Imagem anterior"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={(e) => nextImage(e)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
              aria-label="Próxima imagem"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
            
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {imagensValidas.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentIndex(index);
                    setIsLoading(true);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  )}
                  aria-label={`Ir para imagem ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
            
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm z-10">
              {currentIndex + 1} / {imagensValidas.length}
            </div>
          </>
        )}
      </div>

      <ImageFullscreenViewer
        images={imagensValidas}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        initialIndex={currentIndex}
      />
    </>
  );
}
