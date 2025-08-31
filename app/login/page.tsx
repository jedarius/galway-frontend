'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get redirect parameter
  const redirectTo = searchParams?.get('redirect') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push(redirectTo);
    }
  }, [isLoggedIn, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem('galwayUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Check username/email and password
        const usernameMatch = userData.username.toLowerCase() === username.toLowerCase() || 
                            userData.email.toLowerCase() === username.toLowerCase();
        const passwordMatch = userData.password === password;
        
        if (usernameMatch && passwordMatch) {
          // Successful login
          login({
            username: userData.username,
            role: userData.role,
            onset: userData.onset,
            idNo: userData.idNo,
            bio: userData.bio,
            oliveBranch: userData.oliveBranch
          });
          
          // Redirect to intended page
          router.push(redirectTo);
          return;
        }
      }
      
      // If no stored user or credentials don't match, show error
      setError('Invalid username/email or password');
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-mono text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center p-4 pt-8 min-h-screen">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-xl font-mono font-normal text-black mb-3 uppercase tracking-wide">
              Operative Sign-In
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 font-mono">{error}</p>
              </div>
            )}

            {/* Show redirect notice */}
            {redirectTo !== '/' && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs text-green-700 font-mono">
                  You'll be redirected to {redirectTo} after signing in
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* Username/Email */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-black mb-2 font-mono uppercase tracking-wide">
                  Username or Email
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 font-mono text-sm"
                  placeholder="operative_username"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-2 font-mono uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 font-mono text-sm"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className={`w-full mt-8 py-3 px-6 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                !isLoading && username.trim() && password.trim()
                  ? 'bg-white text-black border-black hover:bg-black hover:text-white'
                  : 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-neutral-600 font-mono">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-black hover:underline transition-all duration-200"
              >
                register
              </Link>
            </p>
            <p className="text-sm text-neutral-500 font-mono">
              <Link 
                href="/" 
                className="hover:text-neutral-700 transition-all duration-200"
              >
                ← back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-mono text-sm">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}