'use client';

import { Forgot_pass_action } from '@/Actions/Auth/Forgot-pass';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send a reset password email
    console.log('Reset password requested for:', email);
     const res  = await   Forgot_pass_action({email})
     if(res.status == 200){
      toast.success(res.message)
     }else{
      toast.error(res.message)
     }
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 dark:bg-[#0a0a12] bg-gray-50">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg dark:bg-[#161626] bg-white dark:text-gray-100 text-gray-900">
        <div className="mb-8">
          <Link href="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Stellar
            </h1>
          </Link>
        </div>

        {isSubmitted ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 dark:bg-[#1e1e3a] bg-green-100">
              <svg className="h-6 w-6 dark:text-purple-400 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-medium mb-2">Password reset email sent</h2>
            <p className="mb-6 dark:text-gray-400 text-gray-600">
              We've sent a password reset link to <span className="font-medium">{email}</span>. Please check your inbox.
            </p>
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-400"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">Forgot your password?</h2>
            <p className="mb-6 dark:text-gray-400 text-gray-600">
              Enter your email address below and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-[#1e1e3a] bg-white dark:border-gray-600 border-gray-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-400"
                >
                  Send reset link
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-sm font-medium dark:text-indigo-400 text-indigo-600 hover:dark:text-indigo-300 hover:text-indigo-500"
              >
                Remember your password? Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}