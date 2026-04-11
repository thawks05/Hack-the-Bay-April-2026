import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import AIWidget from '@/components/AIWidget';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Tampa Energy Intelligence',
  description:
    'Smart city energy optimization platform for Downtown Tampa — monitor districts, analyze consumption, and deploy AI-powered recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        style={{
          backgroundColor: '#0A0F1E',
          color: '#F9FAFB',
          fontFamily: 'Inter, sans-serif',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
        }}
      >
        <Navbar />
        <main style={{ paddingTop: '52px', minHeight: 'calc(100vh - 52px)' }}>
          {children}
        </main>
        {/* AIWidget lives here so it never unmounts across page navigations */}
        <AIWidget />
      </body>
    </html>
  );
}
