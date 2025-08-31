'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/Logo2.jpg"
            alt="StudyAI Logo"
            width={80}
            height={80}
            className="rounded-xl shadow-lg"
          />
        </div>

        {/* 404 Text */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex-1 py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            {/* <Link href="/search" className="flex-1">
              <Button variant="outline" className="w-full py-3">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </Link> */}
          </div>
        </div>

        {/* Popular Links */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Popular pages:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link 
              href="/summary" 
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full"
            >
              Summary
            </Link>
            <Link 
              href="/quiz_qna" 
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full"
            >
              Quiz&Q&A
            </Link>
            <Link 
              href="/current-affairs" 
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full"
            >
              Current Affairs
            </Link>
            <Link 
              href="/interviews/new" 
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full"
            >
              Interview Prep
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  );
}
