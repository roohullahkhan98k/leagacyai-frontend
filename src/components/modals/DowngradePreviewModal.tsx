import { X, AlertTriangle, ArrowDown, Trash2, Mic, User, Network, BrainCircuit, Image, CheckCircle2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { type DowngradeCheckResponse } from '../../services/subscriptionService';

interface DowngradePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  checkData: DowngradeCheckResponse;
  targetPlanName: string;
  isLoading?: boolean;
}

const FEATURE_NAMES: Record<string, string> = {
  'voice_clones': 'Voice Clones',
  'avatar_generations': 'Avatar Generations',
  'memory_graph_operations': 'Memory Graph Operations',
  'interview_sessions': 'Interview Sessions',
  'multimedia_uploads': 'Multimedia Uploads'
};

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'voice_clones': <Mic className="h-5 w-5" />,
  'avatar_generations': <User className="h-5 w-5" />,
  'memory_graph_operations': <Network className="h-5 w-5" />,
  'interview_sessions': <BrainCircuit className="h-5 w-5" />,
  'multimedia_uploads': <Image className="h-5 w-5" />
};

const FEATURE_LINKS: Record<string, string> = {
  'voice_clones': '/voice-cloning',
  'avatar_generations': '/avatar-service',
  'memory_graph_operations': '/memory-graph',
  'interview_sessions': '/interview',
  'multimedia_uploads': '/multimedia'
};

const DowngradePreviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  checkData,
  targetPlanName,
  isLoading = false
}: DowngradePreviewModalProps) => {
  if (!isOpen) return null;

  const planLimits = checkData.comparison || [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 border-2 border-orange-200 dark:border-orange-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {!isLoading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto mb-4">
              <ArrowDown className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Downgrade to {targetPlanName}
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              {checkData.message}
            </p>
          </div>

          {/* New Plan Limits Overview */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              New Plan Limits ({targetPlanName})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {planLimits.map((item, index) => (
                <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    {FEATURE_ICONS[item.feature] || <AlertTriangle className="h-4 w-4" />}
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {FEATURE_NAMES[item.feature] || item.feature}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.newLimit === -1 ? '∞' : item.newLimit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features That Need Cleanup */}
          {checkData.needsCleanup && checkData.featuresExceedingLimit && checkData.featuresExceedingLimit.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Cleanup Required
              </h3>
              <div className="space-y-3">
                {checkData.featuresExceedingLimit.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                        {FEATURE_ICONS[item.feature] || <AlertTriangle className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                          {FEATURE_NAMES[item.feature] || item.feature}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          You have <strong>{item.currentUsage}</strong> items, but {targetPlanName} plan only allows <strong>{item.newLimit}</strong>
                        </p>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Current</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {item.currentUsage}
                            </div>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">New Limit</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {item.newLimit}
                            </div>
                          </div>
                          <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded border-2 border-red-300 dark:border-red-700">
                            <div className="text-xs text-red-600 dark:text-red-400 mb-1">Delete</div>
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                              {item.overage}
                            </div>
                          </div>
                        </div>
                        {FEATURE_LINKS[item.feature] && (
                          <Link
                            to={FEATURE_LINKS[item.feature]}
                            onClick={onClose}
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Go to {FEATURE_NAMES[item.feature]} to delete {item.overage} item(s)
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features That Are Safe */}
          {checkData.featuresWithinLimit && checkData.featuresWithinLimit.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                Features Within Limits
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {checkData.featuresWithinLimit.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {FEATURE_ICONS[item.feature] || <CheckCircle2 className="h-4 w-4" />}
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {FEATURE_NAMES[item.feature] || item.feature}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">{item.currentUsage}</span> / {item.newLimit === -1 ? '∞' : item.newLimit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {checkData.needsCleanup && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800 dark:text-orange-300">
                <p className="font-semibold mb-2">What you need to do:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the links above to go to each feature page</li>
                  <li>Delete the required number of items ({checkData.totalOverage} total)</li>
                  <li>Return here and try downgrading again</li>
                </ol>
                <p className="mt-2 font-medium">
                  You cannot downgrade until you delete {checkData.totalOverage} item(s) that exceed the new plan limits.
                </p>
              </div>
            </div>
          </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {checkData.canDowngrade ? (
              <Button
                variant="primary"
                onClick={onConfirm}
                isLoading={isLoading}
              >
                Confirm Downgrade
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400"
              >
                I'll Clean Up First
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DowngradePreviewModal;

