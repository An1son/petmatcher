import { Inter } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: 'PetMatcher - Find Your Perfect Pet',
    template: '%s | PetMatcher',
  },
  description:
    'Discover adoptable pets that match your lifestyle with our swipe-based matching system. Find dogs, cats, and more from local shelters.',
  keywords: ['pet adoption', 'dog adoption', 'cat adoption', 'animal shelter', 'rescue pets'],
  authors: [{ name: 'PetMatcher Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PetMatcher',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f97316',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
