'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ThemeToggle } from '../comman-Components/theme-toggle';
import { SignUp_Actions } from '@/Actions/Auth/SignUp';
import { Google_Login_Action } from '@/Actions/Auth/ProviderAction';
import { toast } from 'sonner';

interface FormState {
  errors: Record<string, string>;
  message: string;
  status: number;
  data: any;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email address';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    return newErrors;
  };

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
      router.push('/dashboard');
    } else if (state.status === 400) {
      toast.error("Please fix the errors in the form");
    } else if (state.status === 500) {
      toast.error("Something went wrong. Please try again.");
    }
  }, [state, router]);

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
          <form action={action} className="space-y-5 mt-6">
            {/* Error Messages */}
            {state.errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg transition-all duration-300">
                {state.errors.general}
              </div>
            )}
            {state.message && state.status !== 200 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg transition-all duration-300">
                {state.message}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-[#e0e0e0]">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#1e1e2a] border ${
                  state.errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="John Doe"
                disabled={isPending}
              />
              {state.errors.name && <p className="mt-1 text-sm text-red-400 animate-fade-in">{state.errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-[#e0e0e0]">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#1e1e2a] border ${
                  state.errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="john@example.com"
                disabled={isPending}
              />
              {state.errors.email && <p className="mt-1 text-sm text-red-400 animate-fade-in">{state.errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-[#e0e0e0]">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-[#1e1e2a] border ${
                  state.errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="••••••••"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2e2e3a] transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isPending}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
              {state.errors.password && <p className="mt-1 text-sm text-red-400 animate-fade-in">{state.errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-700 dark:text-[#e0e0e0]">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-[#1e1e2a] border ${
                  state.errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="••••••••"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2e2e3a] transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                disabled={isPending}
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
              {state.errors.confirmPassword && <p className="mt-1 text-sm text-red-400 animate-fade-in">{state.errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] dark:from-[#6c63ff] dark:to-[#4a3fff] hover:from-[#4338ca] hover:to-[#6d28d9] dark:hover:from-[#5a52e0] dark:hover:to-[#3a32d0] rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-500/30"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Sign Up
                </span>
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
              {[
                { 
                  provider: 'google', 
                  name: 'Google',
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ),
                  color: "hover:bg-red-50 dark:hover:bg-red-900/10"
                },
                { 
                  provider: 'github',
                  name: 'GitHub',
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path 
                        fill="currentColor" 
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                  ),
                  color: "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                }
              ].map(({ provider, name, icon, color }) => (
                <button
                  key={provider}
                  onClick={() => handleProviderLogin({provider})}
                  disabled={isLoading || isPending}
                  className={`inline-flex w-full items-center justify-center rounded-lg border border-gray-200 dark:border-[#2e2e3a] bg-white dark:bg-[#1e1e2a] p-3 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${color} cursor-pointer`}
                  aria-label={`Sign in with ${name}`}
                >
                  <span className="flex items-center justify-center">
                    {icon}
                    <span className="ml-2 hidden sm:inline">{name}</span>
                  </span>
                </button>
              ))}
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