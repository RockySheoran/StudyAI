import { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout = ({ 
  children, 
  title = 'AI Interview Platform', 
  description = 'Practice your interview skills with AI' 
}: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} AI Interview Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;