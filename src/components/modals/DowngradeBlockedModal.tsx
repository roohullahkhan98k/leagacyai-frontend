import { X, AlertTriangle, Trash2, Mic, User, Network, BrainCircuit, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

interface DowngradeWarning {
  feature: string;
  currentUsage: number;
  newLimit: number;
  overage: number;
  message: string;
}

interface DowngradeBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  warnings: DowngradeWarning[];
  message: string;
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

const DowngradeBlockedModal = ({
  isOpen,
  onClose,
  warnings,
  message
}: DowngradeBlockedModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 border-2 border-orange-200 dark:border-orange-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Cannot Downgrade
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              {message}
            </p>
            <p className="text-sm text-center text-gray-500 dark:text-gray-500">
              You need to delete some items before you can downgrade to the new plan.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Features that need cleanup:
            </h3>
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
                    {FEATURE_ICONS[warning.feature] || <AlertTriangle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {FEATURE_NAMES[warning.feature] || warning.feature.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {warning.message}
                    </p>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Current</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {warning.currentUsage}
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">New Limit</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {warning.newLimit}
                        </div>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border-2 border-red-300 dark:border-red-700">
                        <div className="text-xs text-red-600 dark:text-red-400 mb-1">To Delete</div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {warning.overage}
                        </div>
                      </div>
                    </div>
                    {FEATURE_LINKS[warning.feature] && (
                      <Link
                        to={FEATURE_LINKS[warning.feature]}
                        onClick={onClose}
                        className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                      >
                        <Trash2 className="h-4 w-4" />
                        Go to {FEATURE_NAMES[warning.feature]} to delete items
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800 dark:text-orange-300">
                <p className="font-semibold mb-2">What you need to do:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the links above to go to each feature page</li>
                  <li>Delete the required number of items from each feature</li>
                  <li>Return to billing dashboard and try downgrading again</li>
                </ol>
                <p className="mt-2 font-medium">
                  You cannot downgrade until you delete all items that exceed the new plan limits.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
            >
              I Understand
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DowngradeBlockedModal;

