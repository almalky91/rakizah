import type { Metadata } from 'next';
import '@/index.css';
import '@/App.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Rakizah - منصة تعليمية',
  description: 'منصة تعليمية للمعلمين والطلاب',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
