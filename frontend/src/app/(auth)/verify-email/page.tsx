'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';
import axios from 'axios';

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token && email) {
      verifyEmail();
    } else {
      setError('Invalid verification link');
      setIsLoading(false);
    }
  }, [token, email]);

  const verifyEmail = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-email`, {
        params: { token, email }
      });

      if (response.status === 200) {
        setIsVerified(true);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) return;
    
    try {
      setIsResending(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/resend-verification`, {
        email
      });

      if (response.status === 200) {
        toast.success('Verification email sent! Please check your inbox.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-[#0a0a12] dark:to-[#161622] text-gray-800 dark:text-[#e0e0e0] transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Mobile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden flex justify-center mb-6"
        >
          <div className="w-16 h-16 relative">
            <Image
              src="/Logo2.jpg"
              alt="StudyAI Logo"
              fill
              className="rounded-full object-cover border-4 border-white dark:border-[#2e2e3a] shadow-md"
            />
          </div>
        </motion.div>

        {/* Verification Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full p-6 rounded-2xl shadow-xl bg-white dark:bg-[#1e1e2a] border border-indigo-100 dark:border-[#2e2e3a]"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="hidden md:flex justify-center mb-4">
              <div className="w-16 h-16 relative">
                <Image
                  src="/Logo2.jpg"
                  alt="StudyAI Logo"
                  fill
                  className="rounded-full object-cover border-4 border-white dark:border-[#2e2e3a] shadow-md"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              StudyAI
            </h1>
            <p className="text-sm text-gray-600 dark:text-[#8a8a9b] mt-2">
              Your AI-Powered Learning Companion
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 bg-gradient-to-r from-orange-400 to-pink-500 shadow-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FiRefreshCw className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-[#e0e0e0]">Verifying Your Email...</h2>
              <p className="text-gray-600 dark:text-[#8a8a9b]">
                Please wait while we verify your email address.
              </p>
              <div className="mt-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg p-3">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  📧 Checking your verification token...
                </p>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {!isLoading && isVerified && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg">
                <FiCheck className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-[#e0e0e0]">Email Verified Successfully!</h2>
              <p className="mb-6 text-gray-600 dark:text-[#8a8a9b]">
                Your email has been verified. You can now access all features of StudyAI.
              </p>
              
              {/* Success Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-6 border-l-4 border-green-400">
                <div className="text-left">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-2">
                    🎉 Welcome to StudyAI! You can now:
                  </p>
                  <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                    <li>• Take AI-powered quizzes and assessments</li>
                    <li>• Ask questions and get instant AI responses</li>
                    <li>• Practice interviews with AI feedback</li>
                    <li>• Access current affairs and study materials</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  🚀 Redirecting you to login in 3 seconds...
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-indigo-500/30"
                >
                  <FiArrowLeft className="mr-2 h-5 w-5" />
                  Continue to Login
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* Error State */}
          {!isLoading && error && !isVerified && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 bg-gradient-to-r from-red-400 to-pink-500 shadow-lg">
                <FiX className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-[#e0e0e0]">Verification Failed</h2>
              <p className="mb-6 text-gray-600 dark:text-[#8a8a9b]">
                {error}
              </p>
              
              {/* Error Info Box */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6 border-l-4 border-red-400">
                <div className="text-left">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">
                    ⚠️ Common issues:
                  </p>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                    <li>• Verification link has expired (24 hours)</li>
                    <li>• Link has already been used</li>
                    <li>• Invalid or corrupted link</li>
                  </ul>
                </div>
              </div>

              {/* Resend Button */}
              {email && (
                <motion.button
                  onClick={resendVerification}
                  disabled={isResending}
                  whileHover={{ scale: isResending ? 1 : 1.02 }}
                  whileTap={{ scale: isResending ? 1 : 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-orange-500/30 flex items-center justify-center mb-4"
                >
                  {isResending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <FiRefreshCw className="h-5 w-5" />
                      </motion.div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiMail className="mr-2 h-5 w-5" />
                      Resend Verification Email
                    </>
                  )}
                </motion.button>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/login"
                  className="inline-flex cursor-pointer items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 shadow-md"
                >
                  <FiArrowLeft className="mr-2 h-5 w-5" />
                  Back to Login
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* No Token State */}
          {!isLoading && !token && !email && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
                <FiMail className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-[#e0e0e0]">Email Verification Required</h2>
              <p className="mb-6 text-gray-600 dark:text-[#8a8a9b]">
                Please check your email for the verification link, or request a new one below.
              </p>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 mb-6 border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                  📧 Check your inbox and spam folder for the verification email
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/signup"
                  className="inline-flex cursor-pointer items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-indigo-500/30"
                >
                  <FiArrowLeft className="mr-2 h-5 w-5" />
                  Back to Sign Up
                </Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-500 dark:text-[#6b6b7d]">
            Need help? <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact Support</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
