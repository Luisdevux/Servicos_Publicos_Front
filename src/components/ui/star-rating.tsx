"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  maxStars?: number;
  className?: string;
}

export function StarRating({ 
  value = 0, 
  onChange, 
  readonly = false, 
  maxStars = 5,
  className 
}: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleClick = (starIndex: number) => {
    if (!readonly && onChange) {
      onChange(starIndex + 1);
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (!readonly) {
      setHoveredStar(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredStar(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const isFilled = readonly 
          ? index < value 
          : index < (hoveredStar ?? value);
        
        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "transition-colors duration-150",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
          >
            <Star
              size={20}
              className={cn(
                "transition-colors duration-150",
                isFilled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "fill-gray-200 text-gray-200"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}


