import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: '10ms-hsc-26 | Student Community',
  description: '10ms-hsc-26 student community platform.',
  metadataBase: new URL('https://10ms-seven.vercel.app'), // আপনার ডোমেইন এখানে সেট করা হলো
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '10ms-hsc-26 | Student Community',
    description: 'HSC 26 দের জন্য একটি বিশেষ অনলাইন লার্নিং কমিউনিটি প্ল্যাটফর্ম।',
    url: 'https://10ms-seven.vercel.app',
    siteName: '10ms-hsc-26',
    images: [
      {
        url: '/favicon.ico', // এখানে পরে ১২০০x৬৩০ সাইজের ভালো ছবি দিলে প্রিভিউ সুন্দর হবে
        width: 800,
        height: 600,
        alt: '10ms-hsc-26 Community Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
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
        <AnalyticsTracker />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}