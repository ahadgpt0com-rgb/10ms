import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: '10ms-hsc-26 | Student Community',
  description: '10ms-hsc-26 student community platform.',
  icons: {
    icon: '/favicon.ico', // নিশ্চিত করুন ফাইলটি public/ ফোল্ডারে আছে
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png', // যদি অ্যাপল ডিভাইসের জন্য আইকন থাকে
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
