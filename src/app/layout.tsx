import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import Player from '../components/Player';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hörspiel Browser',
  description: 'Browse German audio plays like TKKG and Benjamin Blümchen',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <Script src="https://js-cdn.music.apple.com/musickit/v1/musickit.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gray-900 text-white">
          <nav className="border-b border-gray-800 bg-gray-900/95 p-4 backdrop-blur-md sticky top-0 z-40">
            <div className="mx-auto flex max-w-screen-xl items-center justify-between">
              <Link href="/" className="text-xl font-bold text-white hover:text-gray-300">
                Hörspiel Browser
              </Link>
              <div className="flex space-x-4">
                <Link href="/" className="text-gray-400 hover:text-white">Start</Link>
                <Link href="/search" className="text-gray-400 hover:text-white">Suche</Link>
              </div>
            </div>
          </nav>
          <main className="mx-auto max-w-screen-xl p-4 md:p-8 pb-32">
            {children}
          </main>
          {/* <Player /> - Disabled for public API version */}
        </div>
      </body>
    </html>
  );
}
