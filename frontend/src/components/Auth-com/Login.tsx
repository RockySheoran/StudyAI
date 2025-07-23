'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/dashboard');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Login failed',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const themeColors = {
    dark: {
      bg: 'bg-[#0a0a12]',
      container: 'bg-[#161622]',
      text: 'text-[#e0e0e0]',
      muted: 'text-[#8a8a9b]',
      border: 'border-[#2e2e3a]',
      gradient: 'from-[#6c63ff] to-[#4a3fff]',
      hoverGradient: 'from-[#5a52e0] to-[#3a32d0]',
      inputBg: 'bg-[#1e1e2a]',
    },
    light: {
      bg: 'bg-gray-50',
      container: 'bg-white',
      text: 'text-gray-800',
      muted: 'text-gray-500',
      border: 'border-gray-200',
      gradient: 'from-[#4f46e5] to-[#7c3aed]',
      hoverGradient: 'from-[#4338ca] to-[#6d28d9]',
      inputBg: 'bg-gray-50',
    },
  };

  return (
    <div className={`min-h-screen ${themeColors[theme].bg} ${themeColors[theme].text} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl ${themeColors[theme].container} border ${themeColors[theme].border} transition-all`}>
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${themeColors[theme].gradient} mb-2`}>
              Welcome Back
            </h1>
            <p className={themeColors[theme].muted}>Sign in to your Stellar account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.submit && (
              <div className={`p-3 ${theme === 'dark' ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-600'} border rounded-lg`}>
                {errors.submit}
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${themeColors[theme].text}`}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 ${themeColors[theme].inputBg} border ${errors.email ? 'border-red-500' : themeColors[theme].border} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${themeColors[theme].text}`}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 ${themeColors[theme].inputBg} border ${errors.password ? 'border-red-500' : themeColors[theme].border} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              {/* <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 rounded ${themeColors[theme].border} ${themeColors[theme].text} focus:ring-indigo-500`}
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${themeColors[theme].muted}`}>
                  Remember me
                </label>
              </div> */}

              <div className="text-sm">
                <a href="/forgot-password" className={`font-medium text-indigo-500 hover:text-indigo-600`}>
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r ${themeColors[theme].gradient} hover:${themeColors[theme].hoverGradient} rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Social Login Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${themeColors[theme].border}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${themeColors[theme].muted} ${theme === 'dark' ? 'bg-[#161622]' : 'bg-white'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { 
                  provider: 'google', 
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )
                },
                { 
                  provider: 'github',
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path 
                        fill={theme === 'dark' ? 'white' : 'black'} 
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                  )
                }
              ].map(({ provider, icon }) => (
                <button
                  key={provider}
                  onClick={() => signIn(provider)}
                  disabled={isLoading}
                  className={`inline-flex w-full items-center justify-center rounded-lg border ${themeColors[theme].border} ${theme === 'dark' ? 'bg-[#1e1e2a] hover:bg-[#2a2a3a]' : 'bg-white hover:bg-gray-50'} p-3 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50`}
                  aria-label={`Sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
                >
                  {icon}
                  <span className="ml-2 hidden sm:inline">
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`mt-6 text-center text-sm ${themeColors[theme].muted}`}>
            Don't have an account?{' '}
            <a href="/signup" className={`font-medium text-indigo-500 hover:text-indigo-600`}>
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}