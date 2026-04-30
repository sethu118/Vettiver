import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Business Hub',
  description: 'Multi-business management portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Top Navigation Bar */}
        <header className="top-nav">
          <div className="top-nav-inner">
            <Link href="/" className="top-nav-brand">
              <span className="brand-icon">🌱</span>
              <span className="brand-name">Business Hub</span>
            </Link>
            <nav className="top-nav-links">
              <Link href="/" className="top-nav-link">Home</Link>
              <Link href="/business" className="top-nav-link">Business</Link>
              <Link href="/contacts" className="top-nav-link">Contacts</Link>
              <Link href="/about" className="top-nav-link">About Us</Link>
            </nav>
          </div>
        </header>

        {/* Main content below top nav */}
        <main className="global-main">
          {children}
        </main>
      </body>
    </html>
  );
}
