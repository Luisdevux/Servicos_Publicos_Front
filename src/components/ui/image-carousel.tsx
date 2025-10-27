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

  const nextImage = () => {
  setCurrentIndex((prev) => (prev + 1) % images.length);
  setIsLoading(true);
  };

  const prevImage = () => {
  setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  setIsLoading(true);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className={cn("relative w-full h-60 rounded-md overflow-hidden border bg-gray-100", className)}>
      <Image
        src={images[currentIndex]}
        alt={`${alt} ${currentIndex + 1}`}
        fill
        className="object-cover"
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
