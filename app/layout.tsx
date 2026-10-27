import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiQR — Platform QR Code Mandiri, Cepat & Aman',
  description: 'Generate QR Code aesthetic, aman, dan tanpa biaya langganan dengan live preview 0ms, evaluator kontras WCAG, dan cloud storage mandiri.',
  icons: {
    icon: [
      { url: '/brand/MiQR.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/brand/MiQR.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="min-h-screen antialiased flex flex-col selection:bg-orange-500 selection:text-white bg-[#070A13] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
