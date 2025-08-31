'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PendingUser {
  username: string;
  email: string;
  password: string;
  role: string;
  onset: string;
  isEmailVerified: boolean;
  registrationStep: string;
  accountCreated: string;
  deletionWarningDate: string;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationCooldown, setVerificationCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  
  // Email editing states
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [emailEditError, setEmailEditError] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Mock verification code for demo (in real app, this would be sent to email)
  const mockVerificationCode = '123456';

  useEffect(() => {
    // Get pending user data
    const storedUser = localStorage.getItem('galwayUserPending');
    if (!storedUser) {
      router.push('/register');
      return;
    }

    const user = JSON.parse(storedUser);
    setPendingUser(user);
    setEditedEmail(user.email);
    setEmailSent(true); // Assume email was sent after registration
  }, [router]);

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Cooldown timer for verification attempts
    if (verificationCooldown > 0) {
      const timer = setTimeout(() => {
        setVerificationCooldown(verificationCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCooldown]);

  // Email validation function (reused from register page)
  const validateEmail = (email: string): { isValid: boolean; error: string } => {
    const cleanEmail = email.toLowerCase().trim();
    
    if (cleanEmail.length === 0) {
      return { isValid: false, error: 'email address is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { isValid: false, error: 'please enter a valid email address' };
    }
    
    if (cleanEmail.length > 254) {
      return { isValid: false, error: 'email address too long' };
    }
    
    return { isValid: true, error: '' };
  };

  const handleEditEmail = () => {
    setIsEditingEmail(true);
    setEmailEditError('');
  };

  const handleCancelEditEmail = () => {
    setIsEditingEmail(false);
    setEditedEmail(pendingUser?.email || '');
    setEmailEditError('');
  };

  const handleSaveEmail = async () => {
    if (!pendingUser || isSavingEmail) return;

    const validation = validateEmail(editedEmail);
    if (!validation.isValid) {
      setEmailEditError(validation.error);
      return;
    }

    const cleanEmail = editedEmail.toLowerCase().trim();
    
    // Check if email actually changed
    if (cleanEmail === pendingUser.email) {
      setIsEditingEmail(false);
      return;
    }

    setIsSavingEmail(true);
    setEmailEditError('');

    try {
      // Simulate API call to update email
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the pending user data
      const updatedUser = {
        ...pendingUser,
        email: cleanEmail
      };

      // Save to localStorage
      localStorage.setItem('galwayUserPending', JSON.stringify(updatedUser));
      
      // Update local state
      setPendingUser(updatedUser);
      setIsEditingEmail(false);
      
      // Reset verification state since email changed
      setVerificationCode('');
      setVerificationError('');
      setResendCooldown(0);
      setVerificationCooldown(0);
      
      // Automatically send verification email to new address
      console.log('Demo: Email updated to', cleanEmail);
      console.log('Demo: New verification code automatically sent to updated email');
      
      // In a real app, you'd make an API call here to send verification email
      // await sendVerificationEmail(cleanEmail);
      
    } catch (error) {
      setEmailEditError('failed to update email. please try again.');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSent(true);
      setResendCooldown(60); // 60 second cooldown
      console.log('Demo: Verification email sent to', pendingUser?.email);
      console.log('Demo: Use code 123456 to verify');
      
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim() || isVerifying || verificationCooldown > 0) return;
    
    setIsVerifying(true);
    setVerificationError('');
    
    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode.trim() === mockVerificationCode) {
        // Verification successful
        if (pendingUser) {
          const verifiedUser = {
            ...pendingUser,
            isEmailVerified: true,
            registrationStep: 'olive_branch_generation'
          };
          
          // Move from pending to verified
          localStorage.removeItem('galwayUserPending');
          localStorage.setItem('galwayUserVerified', JSON.stringify(verifiedUser));
          
          // Redirect to olive branch generation
          router.push('/generate-olive-branch');
        }
      } else {
        setVerificationError('invalid verification code. please try again.');
        setVerificationCooldown(60); // Start 60 second cooldown on failed attempt
      }
      
    } catch (error) {
      setVerificationError('verification failed. please try again.');
      setVerificationCooldown(60); // Start 60 second cooldown on error
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkipVerification = () => {
    if (pendingUser) {
      const unverifiedUser = {
        ...pendingUser,
        isEmailVerified: false,
        registrationStep: 'olive_branch_generation'
      };
      
      // Keep in pending state but proceed
      localStorage.setItem('galwayUserPending', JSON.stringify(unverifiedUser));
      router.push('/generate-olive-branch');
    }
  };

  const formatTimeRemaining = () => {
    if (!pendingUser) return '';
    
    const deletionDate = new Date(pendingUser.deletionWarningDate);
    const now = new Date();
    const timeLeft = deletionDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  };

  if (!pendingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 sm:p-6 pt-8 sm:pt-10 min-h-screen">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3 leading-tight uppercase">
              Verify Your Email
            </h1>
            {/*<p className="text-neutral-600 text-sm leading-relaxed">
              Check your inbox and enter the verification code to activate your account.
            </p>*/}
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-neutral-200 space-y-6">
            {/* Email Status */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-neutral-700 font-mono mb-2 uppercase">
                verification code sent to:
              </p>
              
              {/* Email display/edit section */}
              {isEditingEmail ? (
                <div className="space-y-3">
                  <div>
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value.toLowerCase())}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm text-center"
                      placeholder="new@email.com"
                      autoFocus
                    />
                    {emailEditError && (
                      <p className="text-xs text-red-600 mt-1 font-mono">
                        {emailEditError}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={handleSaveEmail}
                      disabled={isSavingEmail}
                      className="px-3 py-1 text-xs font-mono bg-neutral-900 text-white rounded hover:bg-neutral-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {isSavingEmail ? 'saving...' : 'save'}
                    </button>
                    <button
                      onClick={handleCancelEditEmail}
                      disabled={isSavingEmail}
                      className="px-3 py-1 text-xs font-mono bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors duration-200 disabled:opacity-50"
                    >
                      cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-neutral-900 font-mono text-sm font-medium">
                    {pendingUser.email}
                  </p>
                  <button
                    onClick={handleEditEmail}
                    className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200 p-1"
                    title="Edit email address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Demo Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-800 font-mono text-center">
                Demo Mode: Use code <strong>123456</strong> to verify
              </p>
            </div>

            {/* Verification Code Form */}
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                  verification code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-lg text-center tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                {verificationError && (
                  <p className="text-xs text-red-600 mt-1 font-mono">
                    {verificationError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={verificationCode.length !== 6 || isVerifying || verificationCooldown > 0}
                className={`w-full py-3 px-6 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                  verificationCode.length === 6 && !isVerifying && verificationCooldown === 0
                    ? 'bg-transparent text-neutral-900 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                }`}
              >
                {isVerifying 
                  ? 'verifying...' 
                  : verificationCooldown > 0 
                    ? `wait ${verificationCooldown}s` 
                    : 'verify account'
                }
              </button>
            </form>

            {/* Resend Email */}
            <div className="text-center pt-4 border-t border-neutral-200">
              <p className="text-xs text-neutral-600 font-mono mb-3 uppercase">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className={`text-sm font-mono ${
                  resendCooldown > 0 
                    ? 'text-neutral-400 cursor-not-allowed uppercase' 
                    : 'text-neutral-700 hover:text-neutral-900 hover:underline uppercase'
                } transition-all duration-200`}
              >
                {isResending 
                  ? 'sending...' 
                  : resendCooldown > 0 
                    ? `resend in ${resendCooldown}s` 
                    : 'resend code'
                }
              </button>
            </div>

            {/* Skip Option */}
            <div className="text-center pt-4 border-t border-neutral-200">
              <button
                onClick={handleSkipVerification}
                className="text-sm font-mono text-green-700 hover:text-neutral-800 transition-all duration-200 uppercase"
              >
                skip for now →
              </button>
              <p className="text-xs text-green-700 font-mono mt-1 uppercase">
                (verify later in settings)
              </p>
            </div>

            {/* Deletion Warning */}
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-xs text-red-800 font-mono font-medium uppercase">
                    Account Deletion Warning
                  </p>
                  <p className="text-xs text-red-700 font-mono mt-1 uppercase">
                    Unverified accounts are automatically deleted after 7 days.
                  </p>
                  <p className="text-xs text-red-600 font-mono mt-1 uppercase">
                    Time remaining: <strong>{formatTimeRemaining()}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-6">
            <p className="text-sm text-neutral-500 font-mono">
              <Link 
                href="/register" 
                className="hover:text-neutral-700 transition-all duration-200 uppercase"
              >
                ← back to registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}