'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  FiEye, 
  FiEyeOff, 
  FiEdit2, 
  FiLoader, 
  FiMail, 
  FiLock, 
  FiUser,
  FiAlertCircle,
  FiX
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import { api_Signup_url } from '@/lib/apiEnd_Point_Call';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SignUp_Actions } from '@/Actions/Auth/SignUp';
import { useActionState } from 'react';

// Define Zod schema for form validation
const signUpSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
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

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    reset,
    watch
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  });

  // Handle client-side validation before server action
  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      
      // Call server action
      await formAction(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };
const [state, formAction] = useActionState(SignUp_Actions, {
    errors: {},
    message: "",
    status: 0,
    data: null
  })

  useEffect(() => {
    if (state.status === 200) {
      toast.success(state.message);
      reset();
      router.push("/login");
    }
    if (state.status === 400 || state.status === 500) {
      toast.error(state.message);
      // Set form-level error for server errors
      setError("root", {
        type: "manual",
        message: state.message
      });
    }
  }, [state, reset, router, setError])

  // Handle form submission
  // const onSubmit = async (data: SignUpFormData) => {
  //   setIsLoading(true);
    
  //   try {
  //     const response = await axios.post(api_Signup_url, {
  //       name: data.name,
  //       email: data.email,
  //       password: data.password
  //     });

  //     if (response.data?.user) {
  //       toast.success("Account created successfully!");
  //       reset();
  //       router.push("/login");
  //     } else {
  //       toast.error("Failed to create account");
  //     }
  //   } catch (error: any) {
  //     const errorMessage = error.response?.data?.message || error.message || "Signup failed. Please try again.";
  //     setError("root", {
  //       type: "manual",
  //       message: errorMessage
  //     });
  //     toast.error(errorMessage);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Handle provider login (Google, GitHub, etc.)
  const handleProviderLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      toast.success(`Signing in with ${provider}`);
      
      const result = await signIn(provider, {
        callbackUrl: "/dashboard",
        redirect: true,
      });
      
      if (result?.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Provider login error:", error);
      toast.error(`Failed to sign in with ${provider}`);
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

        {/* Signup Card */}
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
              Join StudyAI
            </h1>
            <p className="text-sm text-gray-500 dark:text-[#8a8a9b] mt-1">
              Create your account to start your learning journey
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Message */}
            {errors.root && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm"
              >
                <FiAlertCircle className="flex-shrink-0" />
                {errors.root.message}
              </motion.div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-[#e0e0e0]">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  {...register('name')}
                  className={`w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-[#161622] border ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <FiAlertCircle className="flex-shrink-0" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
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
                  type="email"
                  {...register('email')}
                  className={`w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-[#161622] border ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="john@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <FiAlertCircle className="flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-[#e0e0e0]">
                Password
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2e2e3a] transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            {/* Confirm Password Field */}
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2e2e3a] transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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

            {/* Submit Button */}
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
                  Creating account...
                </>
              ) : (
                <>
                  <FiEdit2 className="mr-2 h-5 w-5" />
                  Sign Up
                </>
              )}
            </motion.button>
          </form>

          {/* Social Login Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-[#2e2e3a]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 dark:text-[#8a8a9b] bg-white dark:bg-[#1e1e2a]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => handleProviderLogin('google')}
                disabled={isLoading}
                whileHover={{ y: -2 }}
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 dark:border-[#2e2e3a] bg-white dark:bg-[#161622] p-3 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#2a2a3a] cursor-pointer"
                aria-label="Sign in with Google"
              >
                <span className="flex items-center justify-center">
                  <FcGoogle className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Google</span>
                </span>
              </motion.button>

              <motion.button
                onClick={() => handleProviderLogin('github')}
                disabled={isLoading}
                whileHover={{ y: -2 }}
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 dark:border-[#2e2e3a] bg-white dark:bg-[#161622] p-3 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#2a2a3a] cursor-pointer"
                aria-label="Sign in with GitHub"
              >
                <span className="flex items-center justify-center">
                  <FaGithub className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">GitHub</span>
                </span>
              </motion.button>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-[#8a8a9b]">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Log in
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}