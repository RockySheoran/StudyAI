'use client';

import { Forgot_pass_action } from '@/Actions/Auth/Forgot_password';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading ,setLoading]  = useState(false);

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send a reset password email
    setLoading(true);
    console.log('Reset password requested for:', email);
  
     const res  = await   Forgot_pass_action({email})
     if(res.status == 200){
      toast.success(res.message)
      setLoading(false);
      setIsSubmitted(true);
     }else{
      toast.error(res.message)
      setLoading(false);
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

        {/* Forgot Password Card */}
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
          </div>

          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg">
                <FiCheck className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-[#e0e0e0]">Email Sent Successfully!</h2>
              <p className="mb-6 text-gray-600 dark:text-[#8a8a9b]">
                We've sent a password reset link to <span className="font-semibold text-indigo-600 dark:text-indigo-400">{email}</span>. Please check your inbox and follow the instructions.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-indigo-500/30"
                >
                  <FiArrowLeft className="mr-2 h-5 w-5" />
                  Return to Login
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-[#e0e0e0]">Forgot your password?</h2>
              <p className="mb-6 text-gray-600 dark:text-[#8a8a9b]">
                Enter your email address below and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-[#e0e0e0]">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-[#161622] border border-gray-200 dark:border-[#2e2e3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-indigo-500/30 flex items-center justify-center mt-2"
                >
                  <FiMail className="mr-2 h-5 w-5" />
                  {loading ? "Sending..." : "Send Reset Link"}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  <FiArrowLeft className="mr-1 h-4 w-4" />
                  Remember your password? Sign in
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}