'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Reset_pass_action } from '@/Actions/Auth/Reset_password';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define Zod schema for password validation
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must be less than 50 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token');
  const router = useRouter();
  if(!token){
    router.push('/login')
  }
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
    return checks;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    
    try {
      const res = await Reset_pass_action({token : token!, password: data.password, email});
      console.log(res)
      if(res.status == 200){
        toast.success(res.message)
        setIsSuccess(true);
        reset();
      }else{
        toast.error(res.message)
        // Set form-level error for server errors
        setError("root", {
          type: "manual",
          message: res.message
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Password reset failed. Please try again.";
      setError("root", {
        type: "manual",
        message: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

        {/* Reset Password Card */}
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

          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg">
                <FiCheck className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-[#e0e0e0]">Password Reset Successful!</h2>
              <p className="mb-6 text-gray-600 dark:text-[#8a8a9b]">
                Your password has been successfully updated. You can now sign in with your new password.
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
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-[#e0e0e0]">Reset your password</h2>
              <p className="mb-6 text-gray-600 dark:text-[#8a8a9b]">
                {email && <>Create a new password for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{email}</span></>}
              </p>
              
              {/* Error Message */}
              {errors.root && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm"
                >
                  <FiAlertCircle className="flex-shrink-0" />
                  {errors.root.message}
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-[#e0e0e0]">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register('password', {
                        onChange: (e) => setPasswordValue(e.target.value)
                      })}
                      className={`w-full pl-10 px-4 py-3 pr-10 bg-gray-50 dark:bg-[#161622] border ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2e2e3a] transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <FiAlertCircle className="flex-shrink-0" />
                      {errors.password.message}
                    </p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {passwordValue && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Password requirements:</p>
                      <div className="space-y-1">
                        {Object.entries(checkPasswordStrength(passwordValue)).map(([key, isValid]) => (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className={isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                              {key === 'length' && 'At least 8 characters'}
                              {key === 'uppercase' && 'One uppercase letter'}
                              {key === 'lowercase' && 'One lowercase letter'}
                              {key === 'number' && 'One number'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-700 dark:text-[#e0e0e0]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register('confirmPassword')}
                      className={`w-full pl-10 px-4 py-3 pr-10 bg-gray-50 dark:bg-[#161622] border ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2e2e3a] transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <FiAlertCircle className="flex-shrink-0" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-500/30 flex items-center justify-center mt-2"
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="animate-spin mr-2 h-5 w-5 text-white" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <FiLock className="mr-2 h-5 w-5" />
                      Reset Password
                    </>
                  )}
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