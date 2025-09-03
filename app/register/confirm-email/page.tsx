'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PendingUser {
  userId: string;
  username: string;
  email: string;
  registrationComplete: boolean;
}

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Load pending user data from localStorage
    const storedUser = localStorage.getItem('pendingUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setPendingUser(userData);
      } catch (error) {
        console.error('Failed to parse pending user data:', error);
        // Redirect to register if no valid pending user data
        router.push('/register');
      }
    } else {
      // No pending user data, redirect to register
      router.push('/register');
    }

    // Check if user came here via email verification link
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [router]);

  const verifyEmail = async (token: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        // Email verified successfully - update user data and proceed
        const updatedUser = { ...pendingUser, emailVerified: true };
        localStorage.setItem('pendingUser', JSON.stringify(updatedUser));
        
        // Navigate to branch generation
        router.push('/register/generate-branch');
      } else {
        setResendStatus('error');
        setResendMessage(data.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setResendStatus('error');
      setResendMessage('Network error during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!pendingUser) return;

    setIsResending(true);
    setResendStatus('idle');

    try {
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingUser.email })
      });

      const data = await response.json();

      if (response.ok) {
        setResendStatus('success');
        setResendMessage('Verification email sent successfully!');
      } else {
        setResendStatus('error');
        setResendMessage(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend email error:', error);
      setResendStatus('error');
      setResendMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSkipVerification = async () => {
    if (!pendingUser) return;

    setIsSkipping(true);

    try {
      // Log the skip action to backend (optional)
      await fetch(`${API_BASE}/auth/skip-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingUser.userId })
      }).catch(console.error); // Don't block if this fails

      // Navigate to branch generation with unverified status
      router.push('/register/generate-branch');
    } catch (error) {
      console.error('Skip verification error:', error);
      // Still proceed even if logging fails
      router.push('/register/generate-branch');
    } finally {
      setIsSkipping(false);
    }
  };

  if (!pendingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-mono text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-mono text-sm">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} 
        />
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 sm:p-6 pt-8 sm:pt-10 min-h-screen">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-neutral-600 text-sm font-mono">
              Step 2 of 4: Email Confirmation
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-xs font-mono">
              <span className="text-neutral-900">Register</span>
              <span className="text-neutral-900">Verify</span>
              <span className="text-neutral-400">Branch</span>
              <span className="text-neutral-400">Complete</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-neutral-900 h-2 rounded-full w-1/2"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-neutral-200">
            {/* Email Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-neutral-900 font-mono">
                Check Your Email
              </h2>
            </div>

            {/* User Info */}
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <div className="text-sm font-mono">
                <div className="text-neutral-500 mb-1">Account Created For:</div>
                <div className="text-neutral-900 font-medium">{pendingUser.username}</div>
                <div className="text-neutral-700">{pendingUser.email}</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6 text-sm font-mono text-neutral-700 leading-relaxed">
              <p className="mb-3">
                We've sent a verification email to your address. Click the link in the email to verify your account.
              </p>
              <p className="text-xs text-neutral-500">
                The verification link will expire in 24 hours.
              </p>
            </div>

            {/* Status Messages */}
            {resendStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm text-green-700 font-mono">{resendMessage}</p>
                </div>
              </div>
            )}

            {resendStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <p className="text-sm text-red-700 font-mono">{resendMessage}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Resend Email */}
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendStatus === 'success'}
                className={`w-full py-3 px-6 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                  isResending || resendStatus === 'success'
                    ? 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                    : 'bg-transparent text-neutral-900 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isResending ? 'sending...' : resendStatus === 'success' ? 'email sent!' : 'resend verification email'}
              </button>

              {/* Skip Verification */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="text-center mb-4">
                  <p className="text-xs text-neutral-500 font-mono mb-2">
                    Can't access your email right now?
                  </p>
                  <p className="text-xs text-orange-600 font-mono leading-relaxed">
                    ⚠️ Warning: Unverified accounts will be deleted after 7 days
                  </p>
                </div>
                
                <button
                  onClick={handleSkipVerification}
                  disabled={isSkipping}
                  className={`w-full py-3 px-6 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                    isSkipping
                      ? 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                      : 'bg-transparent text-orange-600 border-orange-300 hover:bg-orange-600 hover:text-white hover:border-orange-600'
                  }`}
                >
                  {isSkipping ? 'skipping...' : 'skip for now (verify within 7 days)'}
                </button>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
              <p className="text-xs text-neutral-500 font-mono leading-relaxed">
                Didn't receive the email? Check your spam folder or try a different email address.
              </p>
              <Link 
                href="/correspondence" 
                className="text-xs text-neutral-600 font-mono hover:text-neutral-900 hover:underline mt-2 inline-block"
              >
                Need help? Contact support →
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <Link 
              href="/register" 
              className="text-xs text-neutral-500 font-mono hover:text-neutral-700"
            >
              ← back to registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}