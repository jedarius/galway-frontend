'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  operativeId: string;
  mood: 'happy' | 'unhappy' | '';
  reason: string;
  subject: string;
  message: string;
  files: File[];
}

interface ValidationResult {
  errors: string[];
  isValid: boolean;
}

const HAPPY_REASONS = [
  'Positive Feedback',
  'Staff Appreciation',
  'Research Breakthrough',
  'Feature Request',
  'Improvement Suggestion',
  'Business Proposal',
  'Collaboration Request',
  'Other'
];

const UNHAPPY_REASONS = [
  'Technical Issues',
  'Account & Access',
  'Payment & Billing',
  'Service Report',
  'Policy Questions',
  'Other (Problem)'
];

export default function CorrespondencePage() {
  const { isLoggedIn, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: user?.username || '',
    email: '',
    operativeId: user?.idNo || '',
    mood: '',
    reason: '',
    subject: '',
    message: '',
    files: []
  });

  const [validation, setValidation] = useState<{
    name: ValidationResult;
    email: ValidationResult;
    subject: ValidationResult;
    message: ValidationResult;
  }>({
    name: { errors: [], isValid: false },
    email: { errors: [], isValid: false },
    subject: { errors: [], isValid: false },
    message: { errors: [], isValid: false }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [ticketId, setTicketId] = useState<string>('');

  // Validation functions
  const validateName = (name: string): ValidationResult => {
    const errors: string[] = [];
    if (name.trim().length === 0) {
      return { errors: [], isValid: false };
    }
    if (name.trim().length < 2) {
      errors.push('name must be at least 2 characters');
    }
    return { errors, isValid: errors.length === 0 };
  };

  const validateEmail = (email: string): ValidationResult => {
    const errors: string[] = [];
    if (email.trim().length === 0) {
      return { errors: [], isValid: false };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('please enter a valid email address');
    }
    return { errors, isValid: errors.length === 0 };
  };

  const validateSubject = (subject: string): ValidationResult => {
    const errors: string[] = [];
    if (subject.trim().length === 0) {
      return { errors: [], isValid: false };
    }
    if (subject.trim().length < 3) {
      errors.push('subject must be at least 3 characters');
    }
    return { errors, isValid: errors.length === 0 };
  };

  const validateMessage = (message: string): ValidationResult => {
    const errors: string[] = [];
    if (message.trim().length === 0) {
      return { errors: [], isValid: false };
    }
    if (message.trim().length < 10) {
      errors.push('message must be at least 10 characters');
    }
    if (message.trim().length > 2000) {
      errors.push('message cannot exceed 2000 characters');
    }
    return { errors, isValid: errors.length === 0 };
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset reason when mood changes
    if (field === 'mood') {
      setFormData(prev => ({ ...prev, reason: '' }));
    }
    
    // Validate on change
    let validationResult: ValidationResult;
    switch (field) {
      case 'name':
        validationResult = validateName(value);
        setValidation(prev => ({ ...prev, name: validationResult }));
        break;
      case 'email':
        validationResult = validateEmail(value);
        setValidation(prev => ({ ...prev, email: validationResult }));
        break;
      case 'subject':
        validationResult = validateSubject(value);
        setValidation(prev => ({ ...prev, subject: validationResult }));
        break;
      case 'message':
        validationResult = validateMessage(value);
        setValidation(prev => ({ ...prev, message: validationResult }));
        break;
    }
    
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Check file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        continue;
      }
      
      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }
      
      validFiles.push(file);
    }
    
    // Limit to 3 files total
    const currentFiles = formData.files;
    const totalFiles = [...currentFiles, ...validFiles].slice(0, 3);
    
    setFormData(prev => ({ ...prev, files: totalFiles }));
  };

  // Remove file
  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Generate ticket ID
  const generateTicketId = (): string => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    return `GRI-${year}-${randomNum}`;
  };

  // Check if form is valid
  const isFormValid = Object.values(validation).every(v => v.isValid) && 
                     formData.name.trim().length > 0 &&
                     formData.email.trim().length > 0 &&
                     formData.subject.trim().length > 0 &&
                     formData.message.trim().length > 0 &&
                     formData.mood !== '' &&
                     formData.reason !== '';

  // Get character count styling
  const getCharCountStyle = () => {
    const count = formData.message.length;
    if (count > 2000) return 'text-red-600';
    if (count > 1800) return 'text-yellow-600';
    return 'text-neutral-500';
  };

  // Format email content
  const formatEmailContent = (data: FormData, ticket: string): string => {
    const timestamp = new Date().toISOString();
    const moodEmoji = data.mood === 'happy' ? '🙂' : '😠';

    return `GALWAY RESEARCH INSTITUTE - CORRESPONDENCE

${moodEmoji} MOOD: ${data.mood.toUpperCase()}
📋 REASON: ${data.reason}
🎫 TICKET ID: ${ticket}
🕐 TIMESTAMP: ${timestamp}

---

FROM: ${data.name}
EMAIL: ${data.email}
OPERATIVE ID: ${data.operativeId || 'N/A'}
SUBJECT: ${data.subject}

---

MESSAGE:
${data.message}

${data.files.length > 0 ? `\n---\n\nATTACHMENTS: ${data.files.length} file(s) attached` : ''}

---

This message was submitted via the Galway Research Institute Correspondence Portal.
Please respond to the sender at: ${data.email}

Ticket Reference: ${ticket}
End of transmission.`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ticket = generateTicketId();
      setTicketId(ticket);
      
      const emailContent = formatEmailContent(formData, ticket);
      
      // Store ticket in localStorage for thread tracking
      const existingTickets = JSON.parse(localStorage.getItem('galwayTickets') || '[]');
      existingTickets.push({
        id: ticket,
        subject: formData.subject,
        timestamp: new Date().toISOString(),
        status: 'sent'
      });
      localStorage.setItem('galwayTickets', JSON.stringify(existingTickets));
      
      const mailtoLink = `mailto:support@galwayresearch.org?subject=${encodeURIComponent(`[${ticket}] ${formData.subject}`)}&body=${encodeURIComponent(emailContent)}`;
      
      window.location.href = mailtoLink;
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: user?.username || '',
          email: '',
          operativeId: user?.idNo || '',
          mood: '',
          reason: '',
          subject: '',
          message: '',
          files: []
        });
        setSubmitStatus('idle');
        setTicketId('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 5000);
      
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentReasons = formData.mood === 'happy' ? HAPPY_REASONS : 
                        formData.mood === 'unhappy' ? UNHAPPY_REASONS : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 sm:p-6 pt-8 sm:pt-10 min-h-screen">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <p className="text-neutral-600 text-sm leading-relaxed font-mono">
              Submit correspondence to the Galway Research Institute. 
              All messages are tracked and directed to our response team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-neutral-200">
            
            {/* Name Field */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                NAME
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                placeholder="your full name"
                required
                disabled={isLoggedIn}
              />
              {validation.name.errors.length > 0 && (
                <p className="text-xs text-red-600 mt-1 font-mono">
                  {validation.name.errors[0]}
                </p>
              )}
              {isLoggedIn && (
                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  auto-filled from your profile
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                placeholder="your.email@domain.com"
                required
              />
              {validation.email.errors.length > 0 && (
                <p className="text-xs text-red-600 mt-1 font-mono">
                  {validation.email.errors[0]}
                </p>
              )}
            </div>

            {/* Operative ID */}
            <div className="mb-6">
              <label htmlFor="operativeId" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                OPERATIVE ID (OPTIONAL)
              </label>
              <input
                type="text"
                id="operativeId"
                value={formData.operativeId}
                onChange={(e) => handleInputChange('operativeId', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                placeholder="your operative id"
                disabled={isLoggedIn}
              />
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                {isLoggedIn ? 'auto-filled from your profile' : 'leave blank if not registered'}
              </p>
            </div>

            {/* Mood Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-3 font-mono uppercase">
                HOW ARE YOU FEELING?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('mood', 'happy')}
                  className={`p-4 rounded-lg ${
                    formData.mood === 'happy'
                      ? 'shadow-md scale-105'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <img 
                    src="/msn-emoticons/original/hot-smile.png" 
                    alt="happy" 
                    className="w-12 h-12" 
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('mood', 'unhappy')}
                  className={`p-4 rounded-lg ${
                    formData.mood === 'unhappy'
                      ? 'shadow-md scale-105'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <img 
                    src="/msn-emoticons/original/angry-smile.png" 
                    alt="unhappy" 
                    className="w-12 h-12" 
                  />
                </button>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                REASON
              </label>
              <select
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className={`w-full px-4 py-3 border rounded-md transition-all duration-200 font-mono text-sm ${
                  formData.mood 
                    ? 'border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-white text-neutral-900' 
                    : 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
                required
                disabled={!formData.mood}
              >
                <option value="">
                  {formData.mood ? 'select a reason...' : 'pending...'}
                </option>
                {currentReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {!formData.mood && (
                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  Select mood to unlock reason.
                </p>
              )}
            </div>

            {/* Subject Line */}
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                SUBJECT
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm"
                placeholder="brief description of your message"
                required
              />
              {validation.subject.errors.length > 0 && (
                <p className="text-xs text-red-600 mt-1 font-mono">
                  {validation.subject.errors[0]}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                MESSAGE
              </label>
              <textarea
                id="message"
                rows={6}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm resize-vertical"
                placeholder="provide detailed information about your inquiry..."
                required
              />
              <div className="flex justify-between items-center mt-2">
                {validation.message.errors.length > 0 && (
                  <p className="text-xs text-red-600 font-mono">
                    {validation.message.errors[0]}
                  </p>
                )}
                <p className={`text-xs font-mono ml-auto ${getCharCountStyle()}`}>
                  {formData.message.length} / 2,000 characters
                </p>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label htmlFor="files" className="block text-sm font-medium text-neutral-700 mb-2 font-mono uppercase">
                ATTACHMENTS (OPTIONAL)
              </label>
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="files"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 font-mono text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-mono file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                />
                <p className="text-xs text-neutral-500 font-mono">
                  jpg, png only • max 10mb per file • max 3 files
                </p>
                
                {/* File Previews */}
                {formData.files.length > 0 && (
                  <div className="space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded border">
                        <span className="text-xs font-mono text-neutral-700 truncate">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 text-xs font-mono ml-2"
                        >
                          remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Status */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-sm text-green-700 font-mono">
                      Message prepared for transmission.
                    </p>
                  </div>
                  {ticketId && (
                    <p className="text-xs text-green-600 font-mono">
                      Ticket ID: {ticketId}
                    </p>
                  )}
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <p className="text-sm text-red-700 font-mono">
                    Transmission failed. Please try again.
                  </p>
                </div>
              </div>
            )}

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
              {isSubmitting ? 'transmitting...' : 'send message'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-neutral-500 font-mono">
              <Link 
                href="/" 
                className="hover:text-neutral-700 transition-all duration-200"
              >
                ← return home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}