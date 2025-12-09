import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Upload, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, className }) => {
  const { t } = useTranslation();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, profilePicture: t('auth.onlyImageFiles') }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: t('auth.fileSizeTooLarge') }));
        return;
      }
      
      setProfilePicture(file);
      setErrors(prev => ({ ...prev, profilePicture: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.validEmail');
    }

    if (!formData.username.trim()) {
      newErrors.username = t('auth.usernameRequired');
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = t('auth.usernameLength');
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      newErrors.username = t('auth.usernameAlphanumeric');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    if (formData.firstName && formData.firstName.length > 50) {
      newErrors.firstName = t('auth.firstNameMaxLength');
    }

    if (formData.lastName && formData.lastName.length > 50) {
      newErrors.lastName = t('auth.lastNameMaxLength');
    }

    if (!agreedToPolicies) {
      newErrors.policiesAgreement = t('auth.mustAgreeToPolicies');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const registerData = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      profilePicture: profilePicture || undefined,
    };

    const success = await register(registerData);
    if (success) {
      onSuccess?.();
    }
  };

  return (
    <Card className={`${className} border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300`} variant="elevated">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {t('auth.createAccount')}
        </CardTitle>
        <CardDescription className="text-base">
          {t('auth.signUpToGetStarted')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Profile Picture Preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {profilePicture ? (
                <img 
                  src={URL.createObjectURL(profilePicture)} 
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="profilePicture"
              disabled={isLoading}
            />
            <label
              htmlFor="profilePicture"
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
              title="Add profile picture"
            >
              <Upload className="w-4 h-4" />
            </label>
          </div>
        </div>
        
        {errors.profilePicture && (
          <div className="text-center mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.profilePicture}</p>
          </div>
        )}
        
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('auth.clickIconToAdd')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.email')}
            name="email"
            type="email"
            placeholder={t('auth.enterEmail')}
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            leftIcon={<Mail className="w-5 h-5" />}
            disabled={isLoading}
            autoComplete="email"
          />

          <Input
            label={t('auth.username')}
            name="username"
            type="text"
            placeholder={t('auth.chooseUsername')}
            value={formData.username}
            onChange={handleInputChange}
            error={errors.username}
            leftIcon={<User className="w-5 h-5" />}
            disabled={isLoading}
            autoComplete="username"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('auth.firstName')}
              name="firstName"
              type="text"
              placeholder={t('auth.firstName')}
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              disabled={isLoading}
              autoComplete="given-name"
            />
            <Input
              label={t('auth.lastName')}
              name="lastName"
              type="text"
              placeholder={t('auth.lastName')}
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              disabled={isLoading}
              autoComplete="family-name"
            />
          </div>

          <Input
            label={t('auth.password')}
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.createPassword')}
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
            disabled={isLoading}
            autoComplete="new-password"
          />

          <Input
            label={t('auth.confirmPassword')}
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('auth.confirmYourPassword')}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
            disabled={isLoading}
            autoComplete="new-password"
          />

          {/* Policy Agreement Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="policiesAgreement"
                checked={agreedToPolicies}
                onChange={(e) => {
                  setAgreedToPolicies(e.target.checked);
                  if (errors.policiesAgreement) {
                    setErrors(prev => ({ ...prev, policiesAgreement: '' }));
                  }
                }}
                className="mt-0.5 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                disabled={isLoading}
                required
              />
              <label 
                htmlFor="policiesAgreement"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {t('auth.agreeToPolicies')}{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium"
                >
                  {t('auth.termsAndConditions')}
                </button>
              </label>
            </div>
            {errors.policiesAgreement && (
              <p className="text-sm text-red-600 dark:text-red-400 ml-8">
                {errors.policiesAgreement}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading || !agreedToPolicies}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
              >
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200/50 dark:border-gray-700/50 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {t('auth.termsAndConditions')}
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                  I confirm that I have read, understood, and agree to all Multiventure Industries policies, including the Privacy Policy, Terms of Service, Data Protection Policy, Security & Compliance Policies, AI Governance Policies, and all documents available in the Legal & Compliance Hub. I consent to the processing, storage, and use of my data in accordance with these policies.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800">
              <Button
                onClick={() => setShowTermsModal(false)}
                className="w-full"
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RegisterForm;
