'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on landing page (root path) or PayX pages (they have their own styling)
  const shouldHideFooter = pathname === '/' || pathname?.startsWith('/payx');
  
  if (shouldHideFooter) {
    return null;
  }
  
  return <Footer />;
}