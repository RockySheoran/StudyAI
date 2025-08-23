'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
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
  FiAlertCircle
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { ThemeToggle } from '../common-Components/Theme-toggle';
import { SignUp_Actions } from '@/Actions/Auth/SignUp';
import { Google_Login_Action } from '@/Actions/Auth/ProviderAction';
import { toast } from 'sonner';

// Define Zod schema for form validation
const signUpSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must be less than 50 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface FormState {
  errors: Record<string, string>;
  message: string;
  status: number;
  data: any;
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: clientErrors },
    setError,
    reset
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  });

  const initialState: FormState = {
    errors: {},
    message: "",
    status: 0,
    data: null,
  };

  const [state, action, isPending] = useActionState(SignUp_Actions, initialState);

  // Handle form state changes
  useEffect(() => {
    if (state.status === 200 && state.data) {
      toast.success("Account created successfully!");
      reset();
      router.push('/dashboard');
    } else if (state.status === 400) {
      toast.error("Please fix the errors in the form");
      // Set server errors to form
      Object.entries(state.errors).forEach(([key, value]) => {
        setError(key as keyof SignUpFormData, { message: value });
      });
    } else if (state.status === 500) {
      toast.error("Something went wrong. Please try again.");
    }
  }, [state, router, setError, reset]);

  // Handle provider login (Google, GitHub, etc.)
  const handleProviderLogin = async ({provider}: {provider: string}) => {
    try {
      setIsLoading(true);
      const result = await Google_Login_Action({provider});
      
      if (result?.success) {
        toast.success(`Signing in with ${provider}`);
        window.location.href = result.data.url;
      } else {
        throw new Error(`Failed to initiate ${provider} login`);
      }
    } catch (error) {
      console.error("Provider login error:", error);
      toast.error(`Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a12] text-gray-800 dark:text-[#e0e0e0] transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        {/* Signup Card */}
        <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white dark:bg-[#161622] border border-gray-200 dark:border-[#2e2e3a] transition-all hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] dark:from-[#6c63ff] dark:to-[#4a3fff] mb-2">
              Join Stellar
            </h1>
            <p className="text-gray-500 dark:text-[#8a8a9b]">Create your account to explore the universe</p>
          </div>

          {/* Signup Form */}
          <form action={action} onSubmit={handleSubmit(() => action(new FormData(document.querySelector('form') as HTMLFormElement)))} className="space-y-5 mt-6">
            {/* Error Messages */}
            {state.errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg transition-all duration-300 flex items-center gap-2">
                <FiAlertCircle className="flex-shrink-0" />
                {state.errors.general}
              </div>
            )}
            {state.message && state.status !== 200 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg transition-all duration-300 flex items-center gap-2">
                <FiAlertCircle className="flex-shrink-0" />
                {state.message}
              </div>
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
                  className={`w-full pl-10 px-4 py-2 md:py-3 bg-gray-50 dark:bg-[#1e1e2a] border ${
                    clientErrors.name || state.errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="John Doe"
                  disabled={isPending}
                />
              </div>
              {(clientErrors.name || state.errors.name) && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in flex items-center gap-1">
                  <FiAlertCircle className="flex-shrink-0" />
                  {clientErrors.name?.message || state.errors.name}
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
                  className={`w-full pl-10 px-4 py-2 md:py-3 bg-gray-50 dark:bg-[#1e1e2a] border ${
                    clientErrors.email || state.errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="john@example.com"
                  disabled={isPending}
                />
              </div>
              {(clientErrors.email || state.errors.email) && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in flex items-center gap-1">
                  <FiAlertCircle className="flex-shrink-0" />
                  {clientErrors.email?.message || state.errors.email}
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
                  {...register('password')}
                  className={`w-full pl-10 px-4 py-2 md:py-3 pr-10 bg-gray-50 dark:bg-[#1e1e2a] border ${
                    clientErrors.password || state.errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2e2e3a] transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isPending}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
              {(clientErrors.password || state.errors.password) && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in flex items-center gap-1">
                  <FiAlertCircle className="flex-shrink-0" />
                  {clientErrors.password?.message || state.errors.password}
                </p>
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
                  className={`w-full pl-10 px-4 py-2 md:py-3 pr-10 bg-gray-50 dark:bg-[#1e1e2a] border ${
                    clientErrors.confirmPassword || state.errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2e2e3a] transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={isPending}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
              {(clientErrors.confirmPassword || state.errors.confirmPassword) && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in flex items-center gap-1">
                  <FiAlertCircle className="flex-shrink-0" />
                  {clientErrors.confirmPassword?.message || state.errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 md:py-3 px-4 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] dark:from-[#6c63ff] dark:to-[#4a3fff] hover:from-[#4338ca] hover:to-[#6d28d9] dark:hover:from-[#5a52e0] dark:hover:to-[#3a32d0] rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-500/30 flex items-center justify-center"
            >
              {isPending ? (
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
            </button>
          </form>

          {/* Social Login Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-[#2e2e3a]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 dark:text-[#8a8a9b] bg-white dark:bg-[#161622]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleProviderLogin({provider: 'google'})}
                disabled={isLoading || isPending}
                className={`inline-flex ${isLoading || isPending ? 'opacity-50 cursor-not-allowed disabled' : ''} w-full items-center justify-center rounded-lg border border-gray-200 dark:border-[#2e2e3a] bg-white dark:bg-[#1e1e2a] p-2 md:p-3 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer`}
                aria-label="Sign in with Google"
              >
                <span className="flex items-center justify-center">
                  <FcGoogle className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Google</span>
                </span>
              </button>

              <button
                onClick={() => handleProviderLogin({provider: 'github'})}
                disabled={isLoading || isPending}
                className={`inline-flex ${isLoading || isPending ? 'opacity-50 cursor-not-allowed disabled' : ''} w-full items-center justify-center rounded-lg border border-gray-200 dark:border-[#2e2e3a] bg-white dark:bg-[#1e1e2a] p-2 md:p-3 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer`}
                aria-label="Sign in with GitHub"
              >
                <span className="flex items-center justify-center">
                  <FaGithub className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">GitHub</span>
                </span>
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-[#8a8a9b]">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}