import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Memescope - Trading Terminal',
  description: 'GMGN + Ave.ai style trading terminal for meme tokens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
