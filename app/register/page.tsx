'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ValidationResult {
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Simulated existing usernames for testing
const existingUsernames = ['admin', 'test', 'user', 'galway_research', 'researcher01', 'guest_user'];

// Common weak passwords for warnings
const weakPasswords = ['password', '12345678', 'qwerty123', 'password123', 'admin123'];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [validation, setValidation] = useState<{
    username: ValidationResult;
    email: ValidationResult;
    password: ValidationResult;
    confirmPassword: ValidationResult;
  }>({
    username: { errors: [], warnings: [], isValid: false },
    email: { errors: [], warnings: [], isValid: false },
    password: { errors: [], warnings: [], isValid: false },
    confirmPassword: { errors: [], warnings: [], isValid: false }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateUsername = (username: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Convert to lowercase and trim
    const cleanUsername = username.toLowerCase().trim();
    
    if (cleanUsername.length === 0) {
      return { errors: [], warnings: [], isValid: false };
    }
    
    // Length check
    if (cleanUsername.length < 3) {
      errors.push('username must be at least 3 characters');
    } else if (cleanUsername.length > 20) {
      errors.push('username must be 20 characters or less');
    }
    
    // Instagram rules: letters, numbers, periods, underscores
    if (!/^[a-z0-9._]+$/.test(cleanUsername)) {
      errors.push('only letters, numbers, periods, and underscores allowed');
    }
    
    // Cannot start or end with period
    if (cleanUsername.startsWith('.') || cleanUsername.endsWith('.')) {
      errors.push('cannot start or end with a period');
    }
    
    // Cannot have consecutive periods
    if (cleanUsername.includes('..')) {
      errors.push('cannot have consecutive periods');
    }
    
    // Check against existing usernames
    if (existingUsernames.includes(cleanUsername)) {
      errors.push('username already taken');
    }
    
    // Reserved words
    if (['admin', 'galway', 'research', 'institute'].includes(cleanUsername)) {
      errors.push('username reserved by institute');
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  };

  const validateEmail = (email: string): ValidationResult => {
    const errors: string[] = [];
    const cleanEmail = email.toLowerCase().trim();
    
    if (cleanEmail.length === 0) {
      return { errors: [], warnings: [], isValid: false };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      errors.push('please enter a valid email address');
    }
    
    if (cleanEmail.length > 254) {
      errors.push('email address too long');
    }
    
    return { errors, warnings: [], isValid: errors.length === 0 };
  };

  const validatePassword = (password: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (password.length === 0) {
      return { errors: [], warnings: [], isValid: false };
    }
    
    if (password.length < 8) {
      errors.push('password must be at least 8 characters');
    }
    
    if (password.length > 128) {
      errors.push('password must be less than 128 characters');
    }
    
    // Check for weak passwords (warning only)
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
      warnings.push('this password appears in common vulnerability databases');
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
    const errors: string[] = [];
    
    if (confirmPassword.length === 0) {
      return { errors: [], warnings: [], isValid: false };
    }
    
    if (password !== confirmPassword) {
      errors.push('passwords do not match');
    }
    
    return { errors, warnings: [], isValid: errors.length === 0 };
  };

  // Real-time validation effects
  useEffect(() => {
    const result = validateUsername(formData.username);
    setValidation(prev => ({ ...prev, username: result }));
  }, [formData.username]);

  useEffect(() => {
    const result = validateEmail(formData.email);
    setValidation(prev => ({ ...prev, email: result }));
  }, [formData.email]);

  useEffect(() => {
    const result = validatePassword(formData.password);
    setValidation(prev => ({ ...prev, password: result }));
  }, [formData.password]);

  useEffect(() => {
    const result = validateConfirmPassword(formData.password, formData.confirmPassword);
    setValidation(prev => ({ ...prev, confirmPassword: result }));
  }, [formData.password, formData.confirmPassword]);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'username' || field === 'email') {
      value = value.toLowerCase().trim();
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if form is valid
  const isFormValid = Object.values(validation).every(v => v.isValid) && 
                     Object.values(formData).every(v => v.trim().length > 0);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user data
      const today = new Date();
      const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
      
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password, // In real app, this would be hashed on backend
        role: 'operative' as const,
        onset: formattedDate,
        isEmailVerified: false,
        registrationStep: 'email_verification',
        accountCreated: new Date().toISOString(),
        deletionWarningDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };
      
      // Store in localStorage for demo
      localStorage.setItem('galwayUserPending', JSON.stringify(userData));
      
      // Redirect to email verification
      router.push('/verify-email');
      
    } catch (error) {
      console.error('Registration failed:', error);
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3 leading-tight">
              REGISTER OPERATIVE ID
            </h1>
               {/*<p className="text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                  Participate in Galway Research Institute initiatives!
              </p>*/}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-neutral-200">
            {/* Username Field */}
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                placeholder="your_operative_id"
                required
                autoComplete="username"
              />
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                3-20 characters. letters, numbers, periods, and underscores only.
              </p>
              
              {/* Username validation messages */}
              {validation.username.errors.length > 0 && (
                <p className="text-xs text-red-600 mt-1 font-mono">
                  {validation.username.errors[0]}
                </p>
              )}
              {validation.username.isValid && formData.username.length > 0 && (
                <p className="text-xs text-green-600 mt-1 font-mono">
                  username available
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                placeholder="operative@galwayresearch.org"
                required
                autoComplete="email"
              />
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                confirmation email required to activate account.
              </p>
              
              {/* Email validation messages */}
              {validation.email.errors.length > 0 && (
                <p className="text-xs text-red-600 mt-1 font-mono">
                  {validation.email.errors[0]}
                </p>
              )}
              {validation.email.isValid && formData.email.length > 0 && (
                <p className="text-xs text-green-600 mt-1 font-mono">
                  valid email format
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? 
                    <img src="/eye-closed.png" alt="Hide password" className="w-7 h-7" /> : 
                    <img src="/eye-open.png" alt="Show password" className="w-7 h-7" />
                  }
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                minimum 8 characters. password strength is your responsibility.
              </p>
              
              {/* Password validation messages */}
              {validation.password.errors.length > 0 && (
                <p className="text-xs text-red-600 mt-1 font-mono">
                  {validation.password.errors[0]}
                </p>
              )}
              {validation.password.warnings.length > 0 && validation.password.errors.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1 font-mono">
                  advisory: {validation.password.warnings[0]}
                </p>
              )}
              {validation.password.isValid && validation.password.warnings.length === 0 && formData.password.length > 0 && (
                <p className="text-xs text-green-600 mt-1 font-mono">
                  adequate password length
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-8">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? 
                    <img src="/eye-closed.png" alt="Hide password" className="w-7 h-7" /> : 
                    <img src="/eye-open.png" alt="Show password" className="w-7 h-7" />
                  }
                </button>
              </div>
              
              {/* Confirm password validation messages */}
              {validation.confirmPassword.errors.length > 0 && (
                <p className="text-xs text-red-600 mt-1 font-mono">
                  {validation.confirmPassword.errors[0]}
                </p>
              )}
              {validation.confirmPassword.isValid && formData.confirmPassword.length > 0 && (
                <p className="text-xs text-green-600 mt-1 font-mono">
                  passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 px-6 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                isFormValid && !isSubmitting
                  ? 'bg-transparent text-neutral-900 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'processing...' : 'proceed to verification'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-neutral-600 font-mono uppercase">
              Already registered?{' '}
              <Link 
                href="/login" 
                className="text-green-700 hover:underline transition-all duration-200"
              >
                log-in
              </Link>
            </p>
            <p className="text-sm text-neutral-500 font-mono">
              <Link 
                href="/" 
                className="hover:text-neutral-700 transition-all duration-200 uppercase"
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