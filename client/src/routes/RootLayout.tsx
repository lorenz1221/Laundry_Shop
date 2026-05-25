import type { ReactNode } from 'react';
import DevModeSwitch from '../components/DevModeSwitch';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <DevModeSwitch />
    </>
  );
}
