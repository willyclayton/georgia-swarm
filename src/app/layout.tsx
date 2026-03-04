import type { Metadata, Viewport } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { TopNav } from '@/components/nav/TopNav';
import { BottomNav } from '@/components/nav/BottomNav';
import { PageTransition } from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow-condensed',
});

export const metadata: Metadata = {
  title: 'Georgia Swarm | NLL Fan App',
  description: 'Your go-to app for Georgia Swarm NLL lacrosse — scores, roster, stats, highlights.',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d1b2a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${barlowCondensed.variable} ${inter.className}`} suppressHydrationWarning>
      <body className="bg-swarm-navy min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TopNav />
          <main className="pb-20 md:pb-0 min-h-screen">
            <PageTransition>{children}</PageTransition>
          </main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
