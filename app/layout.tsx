import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider'; // আন্ডারস্কোর (_) সরিয়ে দেওয়া হয়েছে

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: '10ms-hsc-26 | Student Community',
  description: '10ms-hsc-26 student community platform.',
  openGraph: {
    title: '10ms-hsc-26',
    description: 'Student community platform.',
    images: ['/favicon.ico'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body
        className="min-h-screen bg-nat-bg font-sans text-nat-text antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
