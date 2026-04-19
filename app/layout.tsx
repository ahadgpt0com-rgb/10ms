import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { Auth_Provider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });

// icons প্রপার্টি পুরোপুরি সরিয়ে দিন যদি ফাইল app/ ফোল্ডারে থাকে
export const metadata: Metadata = {
  title: '10ms-hsc-26 | Student Community',
  description: '10ms-hsc-26 student community platform.',
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
