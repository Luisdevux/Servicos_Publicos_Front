// src/components/ui/avatar.tsx
'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const iconSizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export function Avatar({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  className = '',
  fallbackIcon 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  // Considera fallback se src for null, undefined ou string vazia
  const showFallback = !src || imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${
        showFallback ? 'bg-gray-100' : ''
      } ${className}`}
      data-test="avatar"
    >
      {showFallback ? (
        <div className="text-global-accent" data-test="avatar-fallback">
          {fallbackIcon || <User className={iconSizeClasses[size]} />}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleImageError}
          data-test="avatar-image"
          crossOrigin="anonymous"
        />
      )}
    </div>
  );
}
