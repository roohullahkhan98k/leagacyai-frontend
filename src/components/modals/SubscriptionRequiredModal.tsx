import { X, Lock, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

interface SubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  featureName?: string;
}

const SubscriptionRequiredModal = ({
  isOpen,
  onClose,
  message,
  featureName
}: SubscriptionRequiredModalProps) => {
  if (!isOpen) return null;

  const handleSubscribe = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border-2 border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-4">
              <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Subscription Required
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              {message}
            </p>
            <p className="text-sm text-center text-gray-500 dark:text-gray-500">
              Subscribe to unlock all features and start using our AI-powered tools.
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/pricing" onClick={handleSubscribe} className="block">
              <Button variant="primary" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequiredModal;

