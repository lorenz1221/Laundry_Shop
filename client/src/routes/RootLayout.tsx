/**
 * RootLayout — Base layout wrapper for the application
 */

import type { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}

export default RootLayout;
