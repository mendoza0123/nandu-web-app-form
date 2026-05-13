import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans, Hind } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

// Hind ships both Devanagari + Latin glyphs; we use it as the per-character
// fallback so Hindi characters get a properly designed face that pairs with
// Jakarta on Latin text in the same line.
const hind = Hind({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-hind',
});

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
    <html lang="en" className={`${jakarta.variable} ${hind.variable}`}>
      <body>{children}</body>
    </html>
  );
}
