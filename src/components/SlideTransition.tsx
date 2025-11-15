// src/components/SlideTransition.tsx

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface SlideTransitionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  duration?: number;
}

export default function SlideTransition({ 
  children, 
  direction = 'right',
  duration = 500
}: SlideTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  const slideClass = direction === 'right' 
    ? 'translate-x-full' 
    : '-translate-x-full';

  return (
    <div
      className={`transform transition-all ease-out ${isVisible ? 'translate-x-0 opacity-100' : `${slideClass} opacity-0`}`}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
}
