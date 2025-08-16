import { ReactNode } from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const Layout = ({ 
  children, 
  title = 'AI Interview Coach', 
  description = 'Practice your interview skills with AI' 
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-white shadow-sm dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white ">AI Interview Coach</h1>
        </div>
      </header>

      <main className="">
        {children}
      </main>

     
    </div>
  );
};