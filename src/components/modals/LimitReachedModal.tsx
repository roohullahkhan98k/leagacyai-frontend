import { X, TrendingUp, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorData: {
    message: string;
    limit: number;
    currentUsage: number;
    remaining: number;
    plan: string;
  };
  featureName?: string;
}

const LimitReachedModal = ({
  isOpen,
  onClose,
  errorData,
  featureName
}: LimitReachedModalProps) => {
  if (!isOpen) return null;

  const getUpgradePlan = (currentPlan: string) => {
    if (currentPlan === 'personal') return 'premium';
    if (currentPlan === 'premium') return 'ultimate';
    return 'ultimate';
  };

  const upgradePlan = getUpgradePlan(errorData.plan);
  const usagePercentage = (errorData.currentUsage / errorData.limit) * 100;

  const handleUpgrade = () => {
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
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Limit Reached
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {errorData.message}
            </p>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Plan</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {errorData.plan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Usage</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {errorData.currentUsage} / {errorData.limit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {errorData.remaining}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ArrowUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">Upgrade to {upgradePlan.toUpperCase()}</p>
                  <p>Get more capacity and unlock unlimited features!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link 
              to="/pricing" 
              onClick={handleUpgrade}
              state={{ upgradeFrom: errorData.plan, highlightPlan: upgradePlan }}
              className="block"
            >
              <Button variant="primary" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
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

export default LimitReachedModal;

