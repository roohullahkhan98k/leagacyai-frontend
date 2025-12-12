import { useState, useEffect } from 'react';
import { 
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
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import { 
  getAllLimits, 
  updateLimit, 
  bulkUpdateLimits, 
  resetLimitsToDefaults,
  type AllLimitsResponse,
  type UpdateLimitRequest
} from '../../services/adminService';
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
  [key: string]: number | string;
}

const PackagesPage = () => {
  const [limits, setLimits] = useState<AllLimitsResponse['limits'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<LimitEditState>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const data = await getAllLimits();
      if (data.success && data.limits) {
        setLimits(data.limits);
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
      await fetchLimits();
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
      await fetchLimits();
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
      await fetchLimits();
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

  // Prepare table data
  const tableData = limits ? (['voice_clones', 'avatar_generations', 'memory_graph_operations', 'interview_sessions', 'multimedia_uploads'] as FeatureName[]).map((feature) => {
    const personalLimit = limits.personal[feature].limit_value;
    const premiumLimit = limits.premium[feature].limit_value;
    const ultimateLimit = limits.ultimate[feature].limit_value;
    
    return {
      feature,
      personal: personalLimit,
      premium: premiumLimit,
      ultimate: ultimateLimit,
      personalEdit: edits[`personal_${feature}`] ?? personalLimit,
      premiumEdit: edits[`premium_${feature}`] ?? premiumLimit,
      ultimateEdit: edits[`ultimate_${feature}`] ?? ultimateLimit,
    };
  }) : [];

  const columns = [
    {
      key: 'feature',
      header: 'Feature',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            {FEATURE_ICONS[item.feature]}
          </div>
          <span className="font-medium">{FEATURE_NAMES[item.feature]}</span>
        </div>
      )
    },
    {
      key: 'personal',
      header: 'Personal',
      render: (item: any) => {
        const isChanged = item.personalEdit !== item.personal;
        const isUnlimited = item.personalEdit === -1;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={isUnlimited ? '' : item.personalEdit}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleLimitChange('personal', item.feature, '-1');
                  } else {
                    handleLimitChange('personal', item.feature, value);
                  }
                }}
                placeholder="Unlimited"
                min="-1"
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button
                size="sm"
                onClick={() => handleSaveLimit('personal', item.feature)}
                disabled={saving === `personal_${item.feature}` || !isChanged}
                variant={isChanged ? 'primary' : 'outline'}
              >
                {saving === `personal_${item.feature}` ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
              </Button>
            </div>
            {isChanged && (
              <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Changed
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'premium',
      header: 'Premium',
      render: (item: any) => {
        const isChanged = item.premiumEdit !== item.premium;
        const isUnlimited = item.premiumEdit === -1;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={isUnlimited ? '' : item.premiumEdit}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleLimitChange('premium', item.feature, '-1');
                  } else {
                    handleLimitChange('premium', item.feature, value);
                  }
                }}
                placeholder="Unlimited"
                min="-1"
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button
                size="sm"
                onClick={() => handleSaveLimit('premium', item.feature)}
                disabled={saving === `premium_${item.feature}` || !isChanged}
                variant={isChanged ? 'primary' : 'outline'}
              >
                {saving === `premium_${item.feature}` ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
              </Button>
            </div>
            {isChanged && (
              <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Changed
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'ultimate',
      header: 'Ultimate',
      render: (item: any) => {
        const isChanged = item.ultimateEdit !== item.ultimate;
        const isUnlimited = item.ultimateEdit === -1;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={isUnlimited ? '' : item.ultimateEdit}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleLimitChange('ultimate', item.feature, '-1');
                  } else {
                    handleLimitChange('ultimate', item.feature, value);
                  }
                }}
                placeholder="Unlimited"
                min="-1"
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button
                size="sm"
                onClick={() => handleSaveLimit('ultimate', item.feature)}
                disabled={saving === `ultimate_${item.feature}` || !isChanged}
                variant={isChanged ? 'primary' : 'outline'}
              >
                {saving === `ultimate_${item.feature}` ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
              </Button>
            </div>
            {isChanged && (
              <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Changed
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Packages</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage feature limits for all subscription plans
          </p>
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

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={tableData}
              loading={loading}
              emptyMessage="No limits found"
            />
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
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
    </AdminLayout>
  );
};

export default PackagesPage;

