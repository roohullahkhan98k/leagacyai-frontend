import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Loader2, 
  Save, 
  RefreshCw, 
  RotateCcw, 
  Mic, 
  User, 
  Network, 
  BrainCircuit, 
  Image,
  CheckCircle2,
  AlertCircle,
  Infinity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  getAllLimits, 
  updateLimit, 
  bulkUpdateLimits, 
  resetLimitsToDefaults,
  type AllLimitsResponse,
  type UpdateLimitRequest
} from '../services/adminService';
import { toast } from 'react-toastify';

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

const PLAN_NAMES: Record<string, string> = {
  'personal': 'Personal',
  'premium': 'Premium',
  'ultimate': 'Ultimate'
};

type PlanType = 'personal' | 'premium' | 'ultimate';
type FeatureName = 'voice_clones' | 'avatar_generations' | 'memory_graph_operations' | 'interview_sessions' | 'multimedia_uploads';

interface LimitEditState {
  [key: string]: number | string; // e.g., "personal_voice_clones": 5
}

const AdminPage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [limits, setLimits] = useState<AllLimitsResponse['limits'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<LimitEditState>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchLimits();
  }, [isAuthenticated, user, navigate]);

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const data = await getAllLimits();
      if (data.success && data.limits) {
        setLimits(data.limits);
        // Initialize edits with current values
        const initialEdits: LimitEditState = {};
        Object.entries(data.limits).forEach(([plan, planLimits]) => {
          Object.entries(planLimits).forEach(([feature, limit]) => {
            const key = `${plan}_${feature}`;
            initialEdits[key] = limit.limit_value;
          });
        });
        setEdits(initialEdits);
        setHasChanges(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load limits');
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (plan: PlanType, feature: FeatureName, value: string) => {
    const key = `${plan}_${feature}`;
    const numValue = value === '' || value === 'Unlimited' ? -1 : parseInt(value);
    setEdits(prev => ({
      ...prev,
      [key]: numValue
    }));
    setHasChanges(true);
  };

  const handleSaveLimit = async (plan: PlanType, feature: FeatureName) => {
    const key = `${plan}_${feature}`;
    const limitValue = edits[key];
    
    if (limitValue === undefined || limitValue === '') {
      toast.error('Please enter a valid limit value');
      return;
    }

    const numValue = typeof limitValue === 'string' ? parseInt(limitValue) : limitValue;

    setSaving(key);
    try {
      const request: UpdateLimitRequest = {
        planType: plan,
        featureName: feature,
        limitValue: numValue
      };
      
      await updateLimit(request);
      toast.success(`Limit updated successfully for ${FEATURE_NAMES[feature]} in ${PLAN_NAMES[plan]} plan`);
      await fetchLimits(); // Refresh
    } catch (error: any) {
      toast.error(error.message || 'Failed to update limit');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAll = async () => {
    if (!limits) return;

    const updates: UpdateLimitRequest[] = [];
    Object.entries(edits).forEach(([key, value]) => {
      const [plan, feature] = key.split('_') as [PlanType, FeatureName];
      const numValue = typeof value === 'string' ? parseInt(value) : value;
      if (numValue !== limits[plan][feature].limit_value) {
        updates.push({
          planType: plan,
          featureName: feature,
          limitValue: numValue
        });
      }
    });

    if (updates.length === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving('all');
    try {
      await bulkUpdateLimits({ limits: updates });
      toast.success(`Updated ${updates.length} limit(s) successfully`);
      await fetchLimits(); // Refresh
    } catch (error: any) {
      toast.error(error.message || 'Failed to update limits');
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all limits to defaults? This action cannot be undone.')) {
      return;
    }

    setSaving('reset');
    try {
      await resetLimitsToDefaults();
      toast.success('All limits reset to defaults');
      await fetchLimits(); // Refresh
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset limits');
    } finally {
      setSaving(null);
    }
  };

  const formatLimitValue = (value: number): string => {
    if (value === -1) return 'Unlimited';
    return value.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading limits...</p>
        </div>
      </div>
    );
  }

  if (!limits) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load limits</p>
          <Button onClick={fetchLimits} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Admin Panel
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage feature limits for all subscription plans
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={fetchLimits}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving !== null}
                className="border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              {hasChanges && (
                <Button
                  variant="primary"
                  onClick={handleSaveAll}
                  disabled={saving !== null}
                >
                  {saving === 'all' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save All Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['personal', 'premium', 'ultimate'] as PlanType[]).map((plan) => (
            <Card key={plan} className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {PLAN_NAMES[plan]} Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {(['voice_clones', 'avatar_generations', 'memory_graph_operations', 'interview_sessions', 'multimedia_uploads'] as FeatureName[]).map((feature) => {
                    const key = `${plan}_${feature}`;
                    const currentLimit = limits[plan][feature];
                    const editValue = edits[key] ?? currentLimit.limit_value;
                    const isUnlimited = editValue === -1;
                    const isChanged = editValue !== currentLimit.limit_value;
                    const isSaving = saving === key;

                    return (
                      <div
                        key={feature}
                        className={`p-4 rounded-lg border-2 ${
                          isChanged
                            ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {FEATURE_ICONS[feature]}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {FEATURE_NAMES[feature]}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Current: {formatLimitValue(currentLimit.limit_value)}
                            </p>
                          </div>
                          {isChanged && (
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              value={isUnlimited ? '' : editValue}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  handleLimitChange(plan, feature, '-1');
                                } else {
                                  handleLimitChange(plan, feature, value);
                                }
                              }}
                              placeholder="Unlimited"
                              min="-1"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {isUnlimited && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Infinity className="h-5 w-5 text-blue-500" />
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSaveLimit(plan, feature)}
                            disabled={isSaving || !isChanged}
                            variant={isChanged ? 'primary' : 'outline'}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleLimitChange(plan, feature, '-1')}
                            className={`text-xs px-2 py-1 rounded ${
                              isUnlimited
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold'
                                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                          >
                            Unlimited
                          </button>
                          <span className="text-xs text-gray-400">|</span>
                          <button
                            onClick={() => handleLimitChange(plan, feature, '0')}
                            className="text-xs px-2 py-1 rounded text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            Disable
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">About Feature Limits</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>-1</strong> means unlimited</li>
                  <li><strong>0</strong> means the feature is disabled for that plan</li>
                  <li>Any positive number sets the monthly limit</li>
                  <li>Changes take effect immediately for all users on that plan</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;

