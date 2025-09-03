'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  bio: string;
  birthday?: string;
  country?: string;
  city?: string;
  acceptTerms: boolean;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  bio?: string;
  general?: string;
}

// API Base URL - update this to match your DigitalOcean server
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Optional Info, 3: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bio: '',
    birthday: '',
    country: '',
    city: '',
    acceptTerms: false
  });

  // Username availability check with debounce
  useEffect(() => {
    if (formData.username.length >= 3) {
      const timeoutId = setTimeout(async () => {
        await checkUsernameAvailability(formData.username);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username]);

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return;
    
    setIsCheckingAvailability(true);
    try {
      const response = await fetch(`${API_BASE}/auth/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Username check failed:', error);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'username cannot exceed 20 characters';
    } else if (!/^[a-z0-9._]+$/.test(formData.username)) {
      newErrors.username = 'username can only contain lowercase letters, numbers, dots, and underscores';
    } else if (/\.\./.test(formData.username)) {
      newErrors.username = 'username cannot contain consecutive periods';
    } else if (usernameAvailable === false) {
      newErrors.username = 'username is already taken';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'passwords do not match';
    }

    // Bio validation
    if (!formData.bio) {
      newErrors.bio = 'bio is required for operative verification';
    } else if (formData.bio.length < 10) {
      newErrors.bio = 'bio must be at least 10 characters';
    } else if (formData.bio.length > 120) {
      newErrors.bio = 'bio cannot exceed 120 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && usernameAvailable === true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Phone validation (optional)
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'please enter a valid phone number';
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.general = 'you must accept the terms to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        bio: formData.bio,
        birthday: formData.birthday || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined
      };

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          // Handle validation errors from backend
          const backendErrors: ValidationErrors = {};
          data.errors.forEach((error: any) => {
            if (error.path) {
              backendErrors[error.path as keyof ValidationErrors] = error.msg;
            }
          });
          setErrors(backendErrors);
        } else {
          setErrors({ general: data.message || 'Registration failed. Please try again.' });
        }
        return;
      }

      // Registration successful
      console.log('Registration successful:', data);
      
      // Store user data temporarily for email confirmation flow
      localStorage.setItem('pendingUser', JSON.stringify({
        userId: data.user.id,
        username: data.user.username,
        email: data.user.email,
        registrationComplete: false
      }));

      // Navigate to email confirmation
      router.push('/register/confirm-email');

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUsernameStatus = () => {
    if (!formData.username || formData.username.length < 3) return null;
    if (isCheckingAvailability) return 'checking...';
    if (usernameAvailable === true) return '✓ available';
    if (usernameAvailable === false) return '✗ taken';
    return null;
  };

  const getUsernameStatusClass = () => {
    if (!formData.username || formData.username.length < 3) return '';
    if (isCheckingAvailability) return 'text-neutral-500';
    if (usernameAvailable === true) return 'text-green-600';
    if (usernameAvailable === false) return 'text-red-600';
    return '';
  };

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
              Join Galway Research
            </h1>
            <p className="text-neutral-600 text-sm font-mono">
              Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Additional Details' : 'Review & Confirm'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className={`text-xs font-mono ${step >= 1 ? 'text-neutral-900' : 'text-neutral-400'}`}>
                Basic Info
              </span>
              <span className={`text-xs font-mono ${step >= 2 ? 'text-neutral-900' : 'text-neutral-400'}`}>
                Details
              </span>
              <span className={`text-xs font-mono ${step >= 3 ? 'text-neutral-900' : 'text-neutral-400'}`}>
                Confirm
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-neutral-900 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-neutral-200">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                      className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm ${
                        errors.username ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                      }`}
                      placeholder="your_username"
                      maxLength={20}
                      disabled={isSubmitting}
                    />
                    {formData.username.length >= 3 && (
                      <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-mono ${getUsernameStatusClass()}`}>
                        {getUsernameStatus()}
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{errors.username}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1 font-mono">
                    3-20 characters, lowercase letters, numbers, dots, underscores only
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                    }`}
                    placeholder="operative@galwayresearch.org"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                    }`}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{errors.password}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1 font-mono">
                    minimum 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                    }`}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    Research Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm resize-vertical ${
                      errors.bio ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                    }`}
                    placeholder="describe your research focus and expertise..."
                    maxLength={120}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.bio ? (
                      <p className="text-xs text-red-600 font-mono">{errors.bio}</p>
                    ) : (
                      <p className="text-xs text-neutral-500 font-mono">required for operative verification</p>
                    )}
                    <p className={`text-xs font-mono ml-auto ${formData.bio.length > 100 ? 'text-yellow-600' : 'text-neutral-500'}`}>
                      {formData.bio.length}/120
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-neutral-600 font-mono text-sm hover:text-neutral-900 transition-colors duration-200"
                  >
                    ← have an account?
                  </Link>
                  <button
                    onClick={handleNext}
                    disabled={!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.bio || isCheckingAvailability || usernameAvailable === false}
                    className={`px-6 py-3 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                      !formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.bio || isCheckingAvailability || usernameAvailable === false
                        ? 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                        : 'bg-transparent text-neutral-900 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                  >
                    continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Additional Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-neutral-600 font-mono">
                    Optional information to enhance your operative profile
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{errors.phone}</p>
                  )}
                </div>

                {/* Birthday */}
                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    Birthday (Optional)
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    value={formData.birthday}
                    onChange={(e) => handleInputChange('birthday', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                      Country (Optional)
                    </label>
                    <input
                      type="text"
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      placeholder="United States"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                      City (Optional)
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      placeholder="San Francisco"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-neutral-900 bg-white border-neutral-300 rounded focus:ring-neutral-900 focus:ring-2"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="acceptTerms" className="text-xs text-neutral-600 font-mono leading-relaxed">
                      I acknowledge that I have read and agree to the{' '}
                      <Link href="/terms" className="text-neutral-900 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-neutral-900 hover:underline">
                        Privacy Policy
                      </Link>
                      . I understand that false information may result in account termination.
                    </label>
                  </div>
                  {errors.general && (
                    <p className="text-xs text-red-600 mt-2 font-mono">{errors.general}</p>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-neutral-600 font-mono text-sm hover:text-neutral-900 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    ← back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!formData.acceptTerms || isSubmitting}
                    className={`px-6 py-3 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                      !formData.acceptTerms || isSubmitting
                        ? 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                        : 'bg-transparent text-neutral-900 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                  >
                    continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-neutral-600 font-mono">
                    Review your information before creating your account
                  </p>
                </div>

                {/* Review Information */}
                <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <span className="text-neutral-500">Username:</span>
                      <p className="text-neutral-900">{formData.username}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Email:</span>
                      <p className="text-neutral-900">{formData.email}</p>
                    </div>
                    {formData.phone && (
                      <div>
                        <span className="text-neutral-500">Phone:</span>
                        <p className="text-neutral-900">{formData.phone}</p>
                      </div>
                    )}
                    {formData.birthday && (
                      <div>
                        <span className="text-neutral-500">Birthday:</span>
                        <p className="text-neutral-900">{new Date(formData.birthday).toLocaleDateString()}</p>
                      </div>
                    )}
                    {(formData.country || formData.city) && (
                      <div className="col-span-2">
                        <span className="text-neutral-500">Location:</span>
                        <p className="text-neutral-900">
                          {[formData.city, formData.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-neutral-500 text-sm font-mono">Research Bio:</span>
                    <p className="text-neutral-900 text-sm font-mono mt-1 leading-relaxed">{formData.bio}</p>
                  </div>
                </div>

                {/* Error Display */}
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700 font-mono">{errors.general}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                      isSubmitting
                        ? 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
                        : 'bg-transparent text-neutral-900 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isSubmitting ? 'creating account...' : 'create account'}
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-neutral-600 font-mono text-sm hover:text-neutral-900 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    ← back to edit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-neutral-500 font-mono">
              Already have an account?{' '}
              <Link href="/login" className="text-neutral-900 hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}