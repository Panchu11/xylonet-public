'use client';

import { usePathname } from 'next/navigation';
import { AnimatedBackground } from './AnimatedBackground';

export function AnimatedBackgroundWrapper() {
  const pathname = usePathname();
  
  // Don't render global animated background on PayX pages - they have their own
  if (pathname?.startsWith('/payx')) {
    return null;
  }
  
  return <AnimatedBackground />;
}
