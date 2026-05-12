import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Nandu Web App Form',
  description: 'LD Brain knowledge capture app for Nandu Bhai and MD interviews.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
