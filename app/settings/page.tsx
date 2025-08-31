'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  username: string;
  email: string;
  password: string;
  role: string;
  roles: string[];
  onset: string;
  idNo: string;
  bio: string;
  isEmailVerified: boolean;
  inventory?: InventoryItem[];
  activeOliveBranchId?: string;
  oliveBranch?: any;
  lastUsernameChange?: string;
  birthday?: string;
  country?: string;
  city?: string;
  twoFactor: {
    sms: {
      enabled: boolean;
      phoneNumber?: string;
    };
    email: {
      enabled: boolean;
    };
  };
}

interface InventoryItem {
  id: string;
  type: 'seed' | 'branch';
  data?: any;
  createdAt: string;
  quantity?: number;
  rarity?: {
    count: string;
    type: string;
    countPercentage: number;
    typePercentage: number;
  };
}

interface ValidationResult {
  errors: string[];
  isValid: boolean;
}

type TabType = 'profile' | 'account' | 'security' | 'danger';

// Comprehensive country list
const COUNTRIES = [
  '', // Empty option
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

export default function SettingsPage() {
  const { isLoggedIn, user, logout, login } = useAuth();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Form states
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Live countdown state
  const [countdown, setCountdown] = useState<string | null>(null);

  // Individual form states
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newBio, setNewBio] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOliveBranch, setSelectedOliveBranch] = useState<string | null>(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newCity, setNewCity] = useState('');

  // Validation states
  const [usernameValidation, setUsernameValidation] = useState<ValidationResult>({ errors: [], isValid: true });
  const [emailValidation, setEmailValidation] = useState<ValidationResult>({ errors: [], isValid: true });
  const [passwordValidation, setPasswordValidation] = useState<ValidationResult>({ errors: [], isValid: true });
  const [currentPasswordValid, setCurrentPasswordValid] = useState<boolean | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteValidationError, setDeleteValidationError] = useState('');

  // 2FA states
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailTwoFactorEnabled, setEmailTwoFactorEnabled] = useState(false);
  const [showSmsSetup, setShowSmsSetup] = useState(false);
  const [smsVerificationCode, setSmsVerificationCode] = useState('');

  // Username change cooldown with live updates
  const getUsernameChangeTimeLeft = () => {
    if (!userData?.lastUsernameChange) return null;
    
    const lastChange = new Date(userData.lastUsernameChange);
    const cooldownEnd = new Date(lastChange.getTime() + 14 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now >= cooldownEnd) return null;
    
    const timeLeft = cooldownEnd.getTime() - now.getTime();
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const canChangeUsername = () => {
    return getUsernameChangeTimeLeft() === null;
  };

  // Live countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getUsernameChangeTimeLeft());
    };

    updateCountdown(); // Initial update
    const interval = setInterval(updateCountdown, 1000); // Update every second

    return () => clearInterval(interval);
  }, [userData?.lastUsernameChange]);

  // Load user data
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const storedUser = localStorage.getItem('galwayUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Set default values for new fields
        const userData: UserData = {
          ...parsed,
          roles: parsed.roles || ['operative'],
          inventory: parsed.inventory || [],
          twoFactor: parsed.twoFactor || {
            sms: { enabled: false },
            email: { enabled: false }
          }
        };
        setUserData(userData);
        setNewUsername(userData.username);
        setNewEmail(userData.email);
        setNewBio(userData.bio || '');
        setSelectedRole(userData.role);
        setSelectedOliveBranch(userData.activeOliveBranchId || null);
        setSmsEnabled(userData.twoFactor.sms.enabled);
        setEmailTwoFactorEnabled(userData.twoFactor.email.enabled);
        setNewPhoneNumber(userData.twoFactor.sms.phoneNumber || '');
        setNewBirthday(userData.birthday || '');
        setNewCountry(userData.country || '');
        setNewCity(userData.city || '');
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    setIsLoading(false);
  }, [isLoggedIn, router]);

  // Validation functions
  const validateUsername = (username: string): ValidationResult => {
    const errors: string[] = [];
    const cleanUsername = username.toLowerCase().trim();
    
    if (cleanUsername.length < 3) {
      errors.push('username must be at least 3 characters');
    } else if (cleanUsername.length > 20) {
      errors.push('username must be 20 characters or less');
    }
    
    if (!/^[a-z0-9._]+$/.test(cleanUsername)) {
      errors.push('only letters, numbers, periods, and underscores allowed');
    }
    
    return { errors, isValid: errors.length === 0 };
  };

  const validateEmail = (email: string): ValidationResult => {
    const errors: string[] = [];
    const cleanEmail = email.toLowerCase().trim();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      errors.push('please enter a valid email address');
    }
    
    return { errors, isValid: errors.length === 0 };
  };

  const validatePassword = (password: string): ValidationResult => {
    const errors: string[] = [];
    
    if (password.length > 0 && password.length < 8) {
      errors.push('password must be at least 8 characters');
    }
    
    return { errors, isValid: errors.length === 0 };
  };

  // Real-time validation
  useEffect(() => {
    if (userData && newUsername !== userData.username) {
      setUsernameValidation(validateUsername(newUsername));
      setHasUnsavedChanges(true);
    } else {
      setUsernameValidation({ errors: [], isValid: true });
    }
  }, [newUsername, userData]);

  useEffect(() => {
    if (userData && newEmail !== userData.email) {
      setEmailValidation(validateEmail(newEmail));
      setHasUnsavedChanges(true);
    } else {
      setEmailValidation({ errors: [], isValid: true });
    }
  }, [newEmail, userData]);

  useEffect(() => {
    if (newPassword.length > 0) {
      setPasswordValidation(validatePassword(newPassword));
      setHasUnsavedChanges(true);
    } else {
      setPasswordValidation({ errors: [], isValid: true });
    }
  }, [newPassword]);

  // Current password validation
  useEffect(() => {
    if (currentPassword.length > 0 && userData) {
      setCurrentPasswordValid(currentPassword === userData.password);
    } else {
      setCurrentPasswordValid(null);
    }
  }, [currentPassword, userData]);

  // Password match validation
  useEffect(() => {
    if (confirmPassword.length > 0 && newPassword.length > 0) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [newPassword, confirmPassword]);

  // Check for other unsaved changes
  useEffect(() => {
    if (!userData) return;
    
    const hasChanges = 
      newBio !== userData.bio ||
      selectedRole !== userData.role ||
      selectedOliveBranch !== (userData.activeOliveBranchId || null) ||
      smsEnabled !== userData.twoFactor.sms.enabled ||
      emailTwoFactorEnabled !== userData.twoFactor.email.enabled ||
      (smsEnabled && newPhoneNumber !== userData.twoFactor.sms.phoneNumber) ||
      newBirthday !== (userData.birthday || '') ||
      newCountry !== (userData.country || '') ||
      newCity !== (userData.city || '');
    
    setHasUnsavedChanges(hasChanges);
  }, [newBio, selectedRole, selectedOliveBranch, smsEnabled, emailTwoFactorEnabled, newPhoneNumber, newBirthday, newCountry, newCity, userData]);

  // Save changes
  const handleSaveChanges = async () => {
    if (!userData || isSaving) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUserData: UserData = {
        ...userData,
        bio: newBio,
        role: selectedRole,
        birthday: newBirthday || undefined,
        country: newCountry || undefined,
        city: newCity || undefined,
        twoFactor: {
          sms: {
            enabled: smsEnabled,
            phoneNumber: smsEnabled ? newPhoneNumber : undefined
          },
          email: {
            enabled: emailTwoFactorEnabled
          }
        }
      };

      // Handle olive branch selection - FIXED: Added null check
      if (selectedOliveBranch !== userData.activeOliveBranchId) {
        const selectedBranch = userData.inventory?.find(item => item.id === selectedOliveBranch);
        if (selectedBranch && selectedOliveBranch) { // Added selectedOliveBranch check
          updatedUserData.activeOliveBranchId = selectedOliveBranch;
          updatedUserData.oliveBranch = selectedBranch.data;
        } else if (!selectedOliveBranch) {
          // Handle case where user is clearing the selection
          updatedUserData.activeOliveBranchId = undefined;
          updatedUserData.oliveBranch = undefined;
        }
      }

      // Handle username change
      if (newUsername !== userData.username && canChangeUsername()) {
        updatedUserData.username = newUsername;
        updatedUserData.lastUsernameChange = new Date().toISOString();
      }

      // Handle email change (requires verification)
      if (newEmail !== userData.email && emailValidation.isValid) {
        setShowEmailVerification(true);
        return;
      }

      // Handle password change
      if (newPassword && passwordValidation.isValid && newPassword === confirmPassword) {
        if (currentPassword === userData.password) {
          updatedUserData.password = newPassword;
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setSaveMessage('Current password is incorrect');
          setIsSaving(false);
          return;
        }
      } else if (newPassword && currentPassword && newPassword !== confirmPassword) {
        setSaveMessage('New passwords do not match');
        setIsSaving(false);
        return;
      } else if (newPassword && currentPassword && currentPassword !== userData.password) {
        setSaveMessage('Current password is incorrect');
        setIsSaving(false);
        return;
      }

      localStorage.setItem('galwayUser', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      
      // Update the auth context with new user data including the selected branch
      if (user) {
        const selectedBranch = updatedUserData.inventory?.find(item => item.id === updatedUserData.activeOliveBranchId);
        const updatedUser = {
          username: updatedUserData.username,
          role: updatedUserData.role as any,
          onset: updatedUserData.onset,
          idNo: updatedUserData.idNo,
          bio: updatedUserData.bio,
          birthday: updatedUserData.birthday,
          country: updatedUserData.country,
          city: updatedUserData.city,
          oliveBranch: selectedBranch?.data
        };
        // Update auth state by calling login with updated data
        login(updatedUser);
      }
      
      setHasUnsavedChanges(false);
      setSaveMessage('Settings saved successfully');
      
    } catch (error) {
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Email verification
  const handleEmailVerification = async () => {
    if (emailVerificationCode === '123456') {
      const updatedUserData = {
        ...userData!,
        email: newEmail,
        isEmailVerified: true
      };
      localStorage.setItem('galwayUser', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setShowEmailVerification(false);
      setEmailVerificationCode('');
      setSaveMessage('Email updated and verified successfully');
      setHasUnsavedChanges(false);
    } else {
      setSaveMessage('Invalid verification code');
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!userData) return;
    
    // Validate username and password
    if (deleteConfirmUsername !== userData.username) {
      setDeleteValidationError('Username does not match');
      return;
    }
    
    if (deleteConfirmPassword !== userData.password) {
      setDeleteValidationError('Password is incorrect');
      return;
    }
    
    // Clear validation error and proceed with deletion
    setDeleteValidationError('');
    localStorage.removeItem('galwayUser');
    logout();
    router.push('/');
  };

  const resetDeleteModal = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmUsername('');
    setDeleteConfirmPassword('');
    setDeleteValidationError('');
  };

  // SMS 2FA setup
  const handleSmsSetup = async () => {
    if (smsVerificationCode === '123456') {
      setSmsEnabled(true);
      setShowSmsSetup(false);
      setSmsVerificationCode('');
      setSaveMessage('SMS 2FA enabled successfully');
    } else {
      setSaveMessage('Invalid SMS verification code');
    }
  };

  // Tab definitions
  const tabs = [
    {
      id: 'profile' as TabType,
      name: 'Profile',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'account' as TabType,
      name: 'Account',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'security' as TabType,
      name: 'Security',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'danger' as TabType,
      name: 'Danger Zone',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 font-mono">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 font-mono">Please log in to access settings</p>
          <Link href="/login" className="text-neutral-900 hover:underline mt-2 inline-block">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Unsaved changes warning */}
      {hasUnsavedChanges && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-50 border border-yellow-200 rounded-md px-4 py-2 z-50">
          <p className="text-sm text-yellow-800 font-mono">You have unsaved changes</p>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Account Settings</h1>
          <p className="text-neutral-600 text-sm font-mono">
            Manage your operative profile and security preferences
          </p>
        </div>

        {/* Save message */}
        {saveMessage && (
          <div className={`mb-6 p-3 rounded-md ${
            saveMessage.includes('success') 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-mono">{saveMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-0" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center space-x-2 px-6 py-4 text-sm font-medium font-mono transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  } ${tab.id === 'danger' ? 'text-red-600 hover:text-red-700' : ''}`}
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">
                    {tab.icon}
                  </span>
                  <span className="uppercase tracking-wide">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Profile Information</h2>
                  <p className="text-sm text-neutral-600 font-mono mb-6">
                    Update your public profile details and preferences.
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                    disabled={!canChangeUsername()}
                    className={`w-full px-4 py-3 border rounded-md font-mono text-sm transition-all duration-200 ${
                      canChangeUsername() 
                        ? 'border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:border-transparent'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed'
                    }`}
                  />
                  {!canChangeUsername() && (
                    <p className="text-xs text-orange-600 mt-1 font-mono">
                      Next change available in: {countdown}
                    </p>
                  )}
                  {usernameValidation.errors.length > 0 && (
                    <p className="text-xs text-red-600 mt-1 font-mono">
                      {usernameValidation.errors[0]}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    bio
                  </label>
                  <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                    rows={3}
                    maxLength={120}
                    placeholder="Tell others about yourself..."
                  />
                  <p className="text-xs text-neutral-500 mt-1 font-mono">
                    {newBio.length}/120 characters
                  </p>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    display role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                  >
                    {userData.roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Olive Branch Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                    active identifier
                  </label>
                  {userData.inventory && userData.inventory.filter(item => item.type === 'branch').length > 1 ? (
                    <div className="space-y-3">
                      <select
                        value={selectedOliveBranch || ''}
                        onChange={(e) => setSelectedOliveBranch(e.target.value || null)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm uppercase"
                      >
                        <option value="">Select a branch...</option>
                        {userData.inventory
                          .filter(item => item.type === 'branch')
                          .map(branch => (
                            <option key={branch.id} value={branch.id}>
                              {branch.data?.oliveCount || 0}-{branch.data?.colors?.olive || '#000000'}-{branch.data?.colors?.branch || '#000000'}-{branch.rarity?.count?.toUpperCase() || 'UNKNOWN'}
                            </option>
                          ))}
                      </select>
                      
                      {/* Branch Preview */}
                      {selectedOliveBranch && userData.inventory && (
                        <div className="flex items-center space-x-4 p-3 bg-neutral-50 rounded-md">
                          <div className="w-16 h-16 border border-neutral-200 rounded-lg overflow-hidden bg-white">
                            {(() => {
                              const branch = userData.inventory.find(item => item.id === selectedOliveBranch);
                              return branch?.data?.svg ? (
                                <div 
                                  className="w-full h-full"
                                  dangerouslySetInnerHTML={{ __html: branch.data.svg }}
                                />
                              ) : null;
                            })()}
                          </div>
                          <div className="flex-1">
                            {(() => {
                              const branch = userData.inventory.find(item => item.id === selectedOliveBranch);
                              return branch?.data ? (
                                <div className="text-xs font-mono text-neutral-600 space-y-1">
                                  <p>{branch.data.oliveCount} {branch.data.oliveType?.toLowerCase()}</p>
                                  {branch.rarity && (
                                    <p>rarity: <span className={`${
                                      branch.rarity.count === 'Very Rare' ? 'text-red-600' :
                                      branch.rarity.count === 'Rare' ? 'text-purple-600' :
                                      branch.rarity.count === 'Uncommon' ? 'text-blue-600' : 'text-green-600'
                                    }`}>{branch.rarity.count.toLowerCase()}</span> ({branch.rarity.countPercentage}%)</p>
                                  )}
                                  <p className="text-neutral-500">id: #{branch.id.slice(-6)}</p>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : userData.inventory && userData.inventory.filter(item => item.type === 'branch').length === 1 ? (
                    <div className="w-full px-4 py-3 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-500 font-mono text-sm">
                      Only one branch available. <Link href="/inventory" className="text-neutral-700 hover:underline">Visit inventory →</Link> to plant seeds for more branches.
                    </div>
                  ) : (
                    <div className="w-full px-4 py-3 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-500 font-mono text-sm uppercase">
                      No alternate branches available. <Link href="/catalog" className="text-green-700 hover:underline">buy seed(s)?</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Account Information</h2>
                  <p className="text-sm text-neutral-600 font-mono mb-6">
                    View and update your account details.
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono lowercase">
                    email address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value.toLowerCase())}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                  />
                  {emailValidation.errors.length > 0 && (
                    <p className="text-xs text-red-600 mt-1 font-mono">
                      {emailValidation.errors[0]}
                    </p>
                  )}
                  {newEmail !== userData.email && (
                    <p className="text-xs text-blue-600 mt-1 font-mono">
                      Email change requires verification
                    </p>
                  )}
                </div>

                {/* Read-only fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2 font-mono lowercase">
                      account onset
                    </label>
                    <div className="w-full px-4 py-3 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-600 font-mono text-sm">
                      {userData.onset}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2 font-mono lowercase">
                      operative id
                    </label>
                    <div className="w-full px-4 py-3 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-600 font-mono text-sm">
                      #{userData.idNo}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-2 font-mono lowercase">
                    email status
                  </label>
                  <div className="w-full px-4 py-3 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-600 font-mono text-sm">
                    {userData.isEmailVerified ? '✓ verified' : '⚠ unverified'}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-neutral-800 mb-4">Personal Information</h3>
                  <p className="text-sm text-neutral-600 font-mono mb-4">
                    Optional demographic information (not displayed publicly).
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono lowercase">
                        birthday
                      </label>
                      <input
                        type="date"
                        value={newBirthday}
                        onChange={(e) => setNewBirthday(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono lowercase">
                        country
                      </label>
                      <select
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      >
                        <option value="">Select a country</option>
                        {COUNTRIES.slice(1).map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono lowercase">
                      city
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="e.g., New York"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Security Settings</h2>
                  <p className="text-sm text-neutral-600 font-mono mb-6">
                    Manage your password and two-factor authentication.
                  </p>
                </div>

                {/* Password Change */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-800 mb-4">Change Password</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono lowercase">
                        current password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      />
                      {currentPasswordValid === true && (
                        <p className="text-xs text-green-600 mt-1 font-mono">
                          ✓ current password verified
                        </p>
                      )}
                      {currentPasswordValid === false && (
                        <p className="text-xs text-red-600 mt-1 font-mono">
                          ✗ incorrect current password
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono lowercase">
                        new password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      />
                      {passwordValidation.errors.length > 0 && (
                        <p className="text-xs text-red-600 mt-1 font-mono">
                          {passwordValidation.errors[0]}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono lowercase">
                        confirm new password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      />
                      {passwordsMatch === true && (
                        <p className="text-xs text-green-600 mt-1 font-mono">
                          ✓ passwords match
                        </p>
                      )}
                      {passwordsMatch === false && (
                        <p className="text-xs text-red-600 mt-1 font-mono">
                          ✗ passwords do not match
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-800 mb-4">Two-Factor Authentication</h3>
                  
                  {/* SMS 2FA */}
                  <div className="mb-4 p-4 border border-neutral-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700 font-mono">SMS Authentication</span>
                      <button
                        onClick={() => smsEnabled ? setSmsEnabled(false) : setShowSmsSetup(true)}
                        className={`px-3 py-1 text-xs font-mono rounded transition-colors duration-200 ${
                          smsEnabled 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {smsEnabled ? 'disable' : 'enable'}
                      </button>
                    </div>
                    {smsEnabled && (
                      <div>
                        <input
                          type="tel"
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                          placeholder="Phone number"
                          className="w-full px-3 py-2 border border-neutral-300 rounded text-sm font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Email 2FA */}
                  <div className="p-4 border border-neutral-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700 font-mono">Email Authentication</span>
                      <button
                        onClick={() => setEmailTwoFactorEnabled(!emailTwoFactorEnabled)}
                        className={`px-3 py-1 text-xs font-mono rounded transition-colors duration-200 ${
                          emailTwoFactorEnabled 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {emailTwoFactorEnabled ? 'disable' : 'enable'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-xl font-semibold text-red-800 mb-4">Danger Zone</h2>
                  <p className="text-sm text-red-600 font-mono mb-6">
                    These actions cannot be undone. Proceed with caution.
                  </p>
                </div>
                
                <div className="p-6 bg-red-50 rounded-md border border-red-200">
                  <h3 className="text-lg font-medium text-red-800 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-600 mb-4 font-mono">
                    This action cannot be undone. All data will be permanently deleted including your operative profile, olive branches, and all associated research records.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-mono rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/"
            className="text-neutral-600 hover:text-neutral-800 transition-colors duration-200 font-mono text-sm"
          >
            ← back to home
          </Link>
          
          <button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving}
            className={`px-6 py-3 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
              hasUnsavedChanges && !isSaving
                ? 'bg-transparent text-neutral-900 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-neutral-200 text-neutral-500 border-neutral-200 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'saving...' : 'save changes'}
          </button>
        </div>
      </div>

      {/* Modals remain the same */}
      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Confirm Account Deletion</h3>
            <p className="text-sm text-neutral-600 mb-6">
              This action cannot be undone. All your data will be permanently deleted including your operative profile, olive branches, and all associated research records.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono">
                  Type your username to confirm: <span className="text-red-600">{userData?.username}</span>
                </label>
                <input
                  type="text"
                  value={deleteConfirmUsername}
                  onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                  placeholder={userData?.username}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                />
              </div>
              
              {deleteValidationError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700 font-mono">{deleteValidationError}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={resetDeleteModal}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors duration-200 font-mono text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deleteConfirmUsername || !deleteConfirmPassword}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-mono text-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Verify New Email</h3>
            <p className="text-sm text-neutral-600 mb-4 font-mono">
              Enter the verification code sent to {newEmail}
            </p>
            <div className="mb-4">
              <input
                type="text"
                value={emailVerificationCode}
                onChange={(e) => setEmailVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-lg text-center tracking-widest"
                maxLength={6}
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-xs text-yellow-800 font-mono text-center">
                Demo Mode: Use code <strong>123456</strong>
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEmailVerification(false);
                  setEmailVerificationCode('');
                }}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors duration-200 font-mono text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailVerification}
                disabled={emailVerificationCode.length !== 6}
                className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-700 transition-colors duration-200 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Setup Modal */}
      {showSmsSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Setup SMS 2FA</h3>
            <p className="text-sm text-neutral-600 mb-4 font-mono">
              Enter the verification code sent to your phone
            </p>
            <div className="mb-4">
              <input
                type="text"
                value={smsVerificationCode}
                onChange={(e) => setSmsVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-lg text-center tracking-widest"
                maxLength={6}
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-xs text-yellow-800 font-mono text-center">
                Demo Mode: Use code <strong>123456</strong>
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSmsSetup(false);
                  setSmsVerificationCode('');
                }}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors duration-200 font-mono text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSmsSetup}
                disabled={smsVerificationCode.length !== 6}
                className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-700 transition-colors duration-200 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enable SMS 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}