"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  FiEye, 
  FiEyeOff, 
  FiLogIn, 
  FiLoader, 
  FiMail, 
  FiLock,
  FiAlertCircle
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Google_Login_Action } from "@/Actions/Auth/ProviderAction";
import { toast } from "sonner";

// Define Zod schema for form validation
const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      
      toast.success("Login successful");
      reset();
      router.push("/dashboard");
    } catch (error) {
      setError("root", {
        type: "manual",
        message: error instanceof Error ? error.message : "Login failed. Please check your credentials."
      });
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social login (Google, GitHub, etc.)
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
      setError("root", {
        type: "manual",
        message: error instanceof Error ? error.message : "Provider login failed"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a12] text-gray-800 dark:text-[#e0e0e0] transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        {/* Login Card */}
        <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white dark:bg-[#161622] border border-gray-200 dark:border-[#2e2e3a] transition-all hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] dark:from-[#6c63ff] dark:to-[#4a3fff] mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 dark:text-[#8a8a9b]">
              Sign in to your Stellar account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Message */}
            {errors.root && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg transition-all duration-300 flex items-center gap-2">
                <FiAlertCircle className="flex-shrink-0" />
                {errors.root.message}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 text-gray-800 dark:text-[#e0e0e0]"
              >
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
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="john@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in flex items-center gap-1">
                  <FiAlertCircle className="flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1 text-gray-800 dark:text-[#e0e0e0]"
              >
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
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-[#2e2e3a] focus:ring-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {/* Show/Hide Password Toggle */}
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
                <p className="mt-1 text-sm text-red-400 animate-fade-in flex items-center gap-1">
                  <FiAlertCircle className="flex-shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 md:py-3 px-4 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] dark:from-[#6c63ff] dark:to-[#4a3fff] hover:from-[#4338ca] hover:to-[#6d28d9] dark:hover:from-[#5a52e0] dark:hover:to-[#3a32d0] rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-500/30 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin mr-2 h-5 w-5 text-white" />
                  Signing in...
                </>
              ) : (
                <>
                  <FiLogIn className="mr-2 h-5 w-5" />
                  Sign In
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
                disabled={isLoading}
                className={`inline-flex ${isLoading ? 'opacity-50 cursor-not-allowed disabled' : ''} w-full items-center justify-center rounded-lg border border-gray-200 dark:border-[#2e2e3a] bg-white dark:bg-[#1e1e2a] p-2 md:p-3 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer`}
                aria-label="Sign in with Google"
              >
                <span className="flex items-center justify-center">
                  <FcGoogle className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Google</span>
                </span>
              </button>

              <button
                onClick={() => handleProviderLogin({provider: 'github'})}
                disabled={isLoading}
                className={`inline-flex ${isLoading ? 'opacity-50 cursor-not-allowed disabled' : ''} w-full items-center justify-center rounded-lg border border-gray-200 dark:border-[#2e2e3a] bg-white dark:bg-[#1e1e2a] p-2 md:p-3 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer`}
                aria-label="Sign in with GitHub"
              >
                <span className="flex items-center justify-center">
                  <FaGithub className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">GitHub</span>
                </span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-[#8a8a9b]">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}