"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

  const nextImage = () => {
  setCurrentIndex((prev) => (prev + 1) % images.length);
  setIsLoading(true);
  };

  const prevImage = () => {
  setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
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

  if (!images || images.length === 0) return null;

  const zoomScale = isHovering ? 2 : 1;

  return (
    <div 
      className={cn("relative w-full h-80 rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={images[currentIndex]}
        alt={`${alt} ${currentIndex + 1}`}
        fill
        className="object-contain cursor-zoom-in"
        style={{ 
          transform: `scale(${zoomScale})`,
          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
          transition: isHovering ? 'transform-origin 0.1s ease-out' : 'transform 0.3s ease-out, transform-origin 0.3s ease-out'
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoadingComplete={() => setIsLoading(false)}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
          <Loader2 className="animate-spin text-white" size={36} />
        </div>
      )}
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            aria-label="Imagem anterior"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            aria-label="Próxima imagem"
          >
            <ChevronRight size={20} />
          </button>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentIndex ? "bg-white" : "bg-white/50"
                )}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
