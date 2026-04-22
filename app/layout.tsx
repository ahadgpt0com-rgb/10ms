import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: '10ms-hsc-26 | Student Community',
  description: '10ms-hsc-26 student community platform for HSC 2026 students.',
  metadataBase: new URL('https://10ms-seven.vercel.app'),
  
  // ব্রাউজার ট্যাব এবং বুকমার্ক আইকন
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico', 
  },

  // Facebook, Messenger, WhatsApp, LinkedIn এর জন্য
  openGraph: {
    title: '10ms-hsc-26 | Student Community',
    description: 'HSC 26 দের জন্য সেরা অনলাইন লার্নিং এবং কমিউনিটি প্ল্যাটফর্ম। একসাথে শিখি, একসাথে বাড়ি!',
    url: 'https://10ms-seven.vercel.app',
    siteName: '10ms-hsc-26',
    locale: 'bn_BD', 
    type: 'website',
    images: [
      {
        url: '/favicon.ico', // মনে রাখবেন: এখানে বড় ব্যানার ইমেজ দিলে শেয়ার করলে দেখতে বেশি সুন্দর লাগবে
        width: 1200,
        height: 630,
        alt: '10ms-hsc-26 Banner',
      },
    ],
  },

  // Twitter/X এর জন্য
  twitter: {
    card: 'summary_large_image',
    title: '10ms-hsc-26 | Student Community',
    description: 'HSC 26 student community platform.',
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
