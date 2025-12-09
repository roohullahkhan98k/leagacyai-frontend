import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, className }) => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = t('auth.emailOrUsername') + ' ' + t('auth.emailRequired').toLowerCase();
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await login(formData);
    if (success) {
      onSuccess?.();
    }
  };

  return (
    <Card className={`${className} border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300`} variant="elevated">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {t('auth.welcomeBack')}
        </CardTitle>
        <CardDescription className="text-base">
          {t('auth.signInToAccount')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.emailOrUsername')}
            name="identifier"
            type="text"
            placeholder={t('auth.enterEmailOrUsername')}
            value={formData.identifier}
            onChange={handleInputChange}
            error={errors.identifier}
            leftIcon={<Mail className="w-5 h-5" />}
            disabled={isLoading}
            autoComplete="username"
          />

          <Input
            label={t('auth.password')}
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.enterPassword')}
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
            autoComplete="current-password"
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.dontHaveAccount')}{' '}
              <Link 
                to="/register" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
              >
                {t('auth.signUp')}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
