import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  X, 
  RefreshCcw, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Info,
  Clock,
  Mic,
  User,
  Network,
  BrainCircuit,
  Image
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  getBillingDashboard, 
  changePlan, 
  cancelSubscription, 
  resumeSubscription,
  getPlans,
  getUserUsage,
  type BillingDashboard,
  type Plan,
  type UsageResponse
} from '../services/subscriptionService';
import { toast } from 'react-toastify';
import DowngradeBlockedModal from '../components/modals/DowngradeBlockedModal';
import DowngradePreviewModal from '../components/modals/DowngradePreviewModal';
import { checkDowngrade, type DowngradeCheckResponse } from '../services/subscriptionService';

// Plan Change Modal Component
interface PlanChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: string;
  newPlan: string;
  planName: string;
  planPrice: number;
  isUpgrade: boolean;
  isDowngrade: boolean;
  isLoading: boolean;
}

const PlanChangeModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  planName,
  planPrice,
  isUpgrade,
  isDowngrade,
  isLoading
}: PlanChangeModalProps) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {!isLoading && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              {isUpgrade ? (
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <ArrowUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              ) : isDowngrade ? (
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <ArrowDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <ArrowDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isUpgrade ? 'Upgrade Plan' : isDowngrade ? 'Downgrade Plan' : 'Change Plan'}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{currentPlan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New Plan</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{newPlan}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    {isUpgrade ? (
                      <>
                        <p className="font-medium mb-1">Your plan will be upgraded immediately</p>
                        <p>You'll be charged A${planPrice}/month. The change takes effect right away, and you'll be billed the prorated amount.</p>
                      </>
                    ) : isDowngrade ? (
                      <>
                        <p className="font-medium mb-1">Your plan will change at the end of the billing period</p>
                        <p>You'll continue with your current plan until the end of your billing period. After that, you'll be moved to the {planName} plan.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium mb-1">Your plan will change at the end of the billing period</p>
                        <p>You'll continue with your current plan until the end of your billing period. After that, you'll be moved to the {planName} plan.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {isUpgrade ? 'Upgrade Now' : isDowngrade ? 'Confirm Downgrade' : 'Confirm Change'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cancel Subscription Modal
interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  periodEnd: string | null | undefined;
  isLoading: boolean;
}

const CancelModal = ({ isOpen, onClose, onConfirm, periodEnd, isLoading }: CancelModalProps) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getTime() === 0) return 'N/A';
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {!isLoading && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cancel Subscription
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to cancel your subscription?
              </p>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800 dark:text-orange-300">
                    <p className="font-medium mb-1">Scheduled Cancellation</p>
                    <p>Your subscription will remain active until the end of your current billing period.</p>
                    {periodEnd && (
                      <p className="mt-2 font-semibold">
                        Access until: {formatDate(periodEnd)}
                      </p>
                    )}
                    <p className="mt-2">You can resume your subscription at any time before this date to continue without interruption.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              isLoading={isLoading}
            >
              Schedule Cancellation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillingDashboardPage = () => {
  const { t } = useTranslation();
  const [billing, setBilling] = useState<BillingDashboard | null>(null);
  const [plans, setPlans] = useState<{ personal: Plan; premium: Plan; ultimate: Plan } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  
  // Modal states
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showDowngradePreview, setShowDowngradePreview] = useState(false);
  const [downgradeWarnings, setDowngradeWarnings] = useState<any[]>([]);
  const [downgradeMessage, setDowngradeMessage] = useState('');
  const [downgradeCheckData, setDowngradeCheckData] = useState<DowngradeCheckResponse | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{
    key: 'personal' | 'premium' | 'ultimate';
    name: string;
    price: number;
    isUpgrade: boolean;
    isDowngrade: boolean;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBilling();
    fetchPlans();
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    setLoadingUsage(true);
    try {
      const data = await getUserUsage();
      setUsage(data);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
      setUsage(null);
    } finally {
      setLoadingUsage(false);
    }
  };

  const fetchBilling = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBillingDashboard();
      setBilling(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing information');
      toast.error(err.message || 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await getPlans();
      if (response.success && response.plans) {
        setPlans(response.plans);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  const handlePlanChangeClick = async (planKey: 'personal' | 'premium' | 'ultimate') => {
    if (!billing?.subscription || !plans) return;
    
    if (billing.subscription.plan === planKey) {
      toast.info(t('billing.alreadyOnPlan'));
      return;
    }

    const plan = plans[planKey];
    const isUpgrade = 
      (billing.subscription.plan === 'personal' && (planKey === 'premium' || planKey === 'ultimate')) ||
      (billing.subscription.plan === 'premium' && planKey === 'ultimate');
    const isDowngrade = 
      (billing.subscription.plan === 'ultimate' && (planKey === 'premium' || planKey === 'personal')) ||
      (billing.subscription.plan === 'premium' && planKey === 'personal');

    // For downgrades, check first before showing confirmation
    if (isDowngrade) {
      try {
        setActionLoading(`check-${planKey}`);
        const checkData = await checkDowngrade(planKey);
        setDowngradeCheckData(checkData);
        setSelectedPlan({
          key: planKey,
          name: plan.name,
          price: plan.price,
          isUpgrade,
          isDowngrade
        });
        setShowDowngradePreview(true);
      } catch (err: any) {
        toast.error(err.message || 'Failed to check downgrade requirements');
      } finally {
        setActionLoading(null);
      }
    } else {
      // For upgrades, show normal confirmation modal
      setSelectedPlan({
        key: planKey,
        name: plan.name,
        price: plan.price,
        isUpgrade,
        isDowngrade
      });
      setShowPlanChangeModal(true);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan || !billing?.subscription) return;

    setActionLoading(`change-${selectedPlan.key}`);
    try {
      const data = await changePlan(selectedPlan.key);
      if (data.success) {
        toast.success(data.message || t('billing.planChanged'));
        setShowPlanChangeModal(false);
        setShowDowngradePreview(false);
        setSelectedPlan(null);
        setDowngradeCheckData(null);
        await fetchBilling();
        await fetchUsage(); // Refresh usage after plan change
      }
    } catch (err: any) {
      // Check if it's a downgrade blocked error
      if (err?.response?.status === 403 || err?.status === 403) {
        const errorData = err?.response?.data || err?.data || err;
        if (errorData.error === 'Downgrade not allowed' && (errorData.warnings || errorData.blockedFeatures)) {
          setDowngradeWarnings(errorData.warnings || errorData.blockedFeatures || []);
          setDowngradeMessage(errorData.message || 'Cannot downgrade: You have features that exceed the new plan limits. Please delete items to continue.');
          setShowPlanChangeModal(false);
          setShowDowngradePreview(false);
          setShowDowngradeModal(true);
          setActionLoading(null);
          return;
        }
      }
      toast.error(err.message || t('billing.changePlanError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading('cancel');
    try {
      const data = await cancelSubscription();
      if (data.success) {
        toast.success(data.message || t('billing.cancelSuccess'));
        setShowCancelModal(false);
        await fetchBilling();
      }
    } catch (err: any) {
      toast.error(err.message || t('billing.cancelError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async () => {
    setActionLoading('resume');
    try {
      const data = await resumeSubscription();
      if (data.success) {
        toast.success(data.message || t('billing.resumeSuccess'));
        await fetchBilling();
      }
    } catch (err: any) {
      toast.error(err.message || t('billing.resumeError'));
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getTime() === 0) {
      return 'N/A';
    }
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('billing.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !billing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md border border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{t('billing.error')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button onClick={fetchBilling}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              {t('common.refresh')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('billing.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                {t('billing.subtitle')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchBilling}
              disabled={loading}
              className="hidden sm:flex"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </div>
        </div>

        {!billing?.hasSubscription ? (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t('billing.noSubscription')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('billing.noSubscriptionDescription')}
              </p>
              <Link to="/pricing">
                <Button variant="primary">
                  {t('billing.viewPlans')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Current Subscription */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {billing.subscription && (
                  <div className="space-y-6">
                    {/* Plan Info */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">
                            {billing.subscription.plan}
                          </span>
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                            billing.subscription.cancelAtPeriodEnd
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                              : billing.subscription.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                          }`}>
                            {billing.subscription.cancelAtPeriodEnd ? 'Canceling' : billing.subscription.status}
                          </span>
                        </div>
                        {billing.subscription.cancelAtPeriodEnd ? (
                          <div className="mt-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-orange-800 dark:text-orange-300">
                                <p className="font-semibold mb-1">Scheduled for cancellation</p>
                                <p className="mt-1">
                                  Your subscription will be automatically canceled at the end of your billing period.
                                  {billing.subscription.currentPeriodEnd && (
                                    <> You can resume it anytime before <span className="font-semibold">{formatDate(billing.subscription.currentPeriodEnd)}</span>.</>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-green-800 dark:text-green-300">
                                <p className="font-semibold mb-1">Active subscription</p>
                                <p className="mt-1">
                                  {billing.subscription.currentPeriodEnd ? (
                                    <>Your subscription will be automatically renewed on <span className="font-semibold">{formatDate(billing.subscription.currentPeriodEnd)}</span>.</>
                                  ) : (
                                    'Your subscription is active and will be automatically renewed.'
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Billing Period</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {billing.subscription.currentPeriodStart && billing.subscription.currentPeriodEnd
                            ? `${formatDate(billing.subscription.currentPeriodStart)} - ${formatDate(billing.subscription.currentPeriodEnd)}`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Plan Actions */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                        Change Plan
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans && Object.entries(plans).map(([key, plan]) => {
                          const planKey = key as 'personal' | 'premium' | 'ultimate';
                          const isCurrentPlan = billing.subscription?.plan === planKey;
                          const isUpgrade = 
                            (billing.subscription?.plan === 'personal' && (planKey === 'premium' || planKey === 'ultimate')) ||
                            (billing.subscription?.plan === 'premium' && planKey === 'ultimate');
                          const isDowngrade = 
                            (billing.subscription?.plan === 'ultimate' && (planKey === 'premium' || planKey === 'personal')) ||
                            (billing.subscription?.plan === 'premium' && planKey === 'personal');

                          return (
                            <div
                              key={planKey}
                              className={`p-5 rounded-xl border-2 transition-all ${
                                isCurrentPlan
                                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-700 shadow-sm'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm bg-white dark:bg-gray-800'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white capitalize text-lg">
                                  {plan.name}
                                </h4>
                                {isCurrentPlan && (
                                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-5">
                                A${plan.price}
                                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">/mo</span>
                              </p>
                              <Button
                                size="sm"
                                variant={isCurrentPlan ? 'outline' : 'primary'}
                                className="w-full"
                                onClick={() => handlePlanChangeClick(planKey)}
                                disabled={isCurrentPlan || actionLoading !== null}
                              >
                                {actionLoading === `change-${planKey}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : isUpgrade ? (
                                  <ArrowUp className="h-4 w-4 mr-2" />
                                ) : isDowngrade ? (
                                  <ArrowDown className="h-4 w-4 mr-2" />
                                ) : null}
                                {isCurrentPlan 
                                  ? 'Current Plan'
                                  : isUpgrade 
                                  ? 'Upgrade'
                                  : isDowngrade
                                  ? 'Downgrade'
                                  : 'Switch'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cancel/Resume Actions */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      {billing.subscription.cancelAtPeriodEnd ? (
                        <div className="space-y-3">
                          <Button
                            variant="primary"
                            onClick={handleResume}
                            disabled={actionLoading !== null}
                            className="w-full sm:w-auto"
                          >
                            {actionLoading === 'resume' ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <RefreshCcw className="h-4 w-4 mr-2" />
                            )}
                            Resume Subscription
                          </Button>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Resuming will cancel the scheduled cancellation and keep your subscription active.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowCancelModal(true)}
                            disabled={actionLoading !== null}
                            className="w-full sm:w-auto border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Subscription
                          </Button>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Canceling will schedule your subscription to end at the end of your current billing period. You can resume anytime before then.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            {usage && (
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    Feature Usage - {usage.plan.toUpperCase()} Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingUsage ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { key: 'voice_clones', label: 'Voice Clones', icon: <Mic className="h-6 w-6" />, description: 'Voice cloning operations' },
                        { key: 'avatar_generations', label: 'Avatar Generations', icon: <User className="h-6 w-6" />, description: '3D avatar creations' },
                        { key: 'memory_graph_operations', label: 'Memory Nodes', icon: <Network className="h-6 w-6" />, description: 'Memory graph operations' },
                        { key: 'interview_sessions', label: 'Interview Sessions', icon: <BrainCircuit className="h-6 w-6" />, description: 'AI interview sessions' },
                        { key: 'multimedia_uploads', label: 'Multimedia Nodes', icon: <Image className="h-6 w-6" />, description: 'Multimedia node creations' }
                      ].map((feature) => {
                        const stat = usage.stats[feature.key as keyof typeof usage.stats];
                        const isLow = !stat.isUnlimited && stat.percentage >= 80;
                        const isExhausted = !stat.isUnlimited && stat.remaining === 0;
                        
                        return (
                          <div
                            key={feature.key}
                            className={`p-5 rounded-xl border-2 ${
                              isExhausted 
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' 
                                : isLow
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {/* Feature Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`p-2.5 rounded-lg ${
                                isExhausted 
                                  ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' 
                                  : isLow
                                  ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {feature.icon}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                  {feature.label}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {feature.description}
                                </p>
                              </div>
                            </div>

                            {/* Remaining Count - Most Prominent */}
                            <div className="text-center mb-4 py-3">
                              {stat.isUnlimited ? (
                                <div className="space-y-1">
                                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">∞</div>
                                  <div className="text-sm font-semibold text-green-700 dark:text-green-400">Unlimited</div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className={`text-4xl font-bold ${
                                    isExhausted 
                                      ? 'text-red-600 dark:text-red-400' 
                                      : isLow
                                      ? 'text-orange-600 dark:text-orange-400'
                                      : 'text-green-600 dark:text-green-400'
                                  }`}>
                                    {stat.remaining}
                                  </div>
                                  <div className={`text-sm font-semibold ${
                                    isExhausted 
                                      ? 'text-red-700 dark:text-red-400' 
                                      : isLow
                                      ? 'text-orange-700 dark:text-orange-400'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {stat.remaining === 1 ? 'remaining' : 'remaining'}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Usage Details */}
                            <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Used</span>
                                <span className={`text-xs font-bold ${
                                  isExhausted ? 'text-red-600 dark:text-red-400' :
                                  isLow ? 'text-orange-600 dark:text-orange-400' :
                                  'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {stat.isUnlimited ? (
                                    <span className="text-green-600 dark:text-green-400">{stat.currentUsage} used</span>
                                  ) : (
                                    <span>{stat.currentUsage} / {stat.limit}</span>
                                  )}
                                </span>
                              </div>
                              {!stat.isUnlimited && (
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full transition-all ${
                                      isExhausted ? 'bg-red-500' :
                                      isLow ? 'bg-orange-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                                  />
                                </div>
                              )}
                              {isExhausted && (
                                <Link 
                                  to="/pricing" 
                                  className="block w-full text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors pt-1"
                                >
                                  Upgrade Plan →
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            {billing.paymentMethod && (
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {billing.paymentMethod.card && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <CreditCard className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-base">
                            {billing.paymentMethod.card.brand.toUpperCase()} ****{billing.paymentMethod.card.last4}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Expires {billing.paymentMethod.card.expMonth}/{billing.paymentMethod.card.expYear}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Invoice */}
            {billing.upcomingInvoice && (
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    Upcoming Invoice
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(billing.upcomingInvoice.amount, billing.upcomingInvoice.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Payment</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(billing.upcomingInvoice.nextPaymentAttempt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Period</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(billing.upcomingInvoice.periodStart)} - {formatDate(billing.upcomingInvoice.periodEnd)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice History */}
            {billing.invoices && billing.invoices.length > 0 && (
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    Invoice History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {billing.invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-900 dark:text-white text-base">
                              {invoice.number}
                            </p>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(invoice.amount, invoice.currency)} • {formatDate(invoice.created)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {invoice.hostedInvoiceUrl && (
                            <a
                              href={invoice.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title={t('billing.viewInvoice')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {invoice.invoicePdf && (
                            <a
                              href={invoice.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title={t('billing.downloadPDF')}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedPlan && (
        <PlanChangeModal
          isOpen={showPlanChangeModal}
          onClose={() => {
            setShowPlanChangeModal(false);
            setSelectedPlan(null);
          }}
          onConfirm={handleChangePlan}
          currentPlan={billing?.subscription?.plan || ''}
          newPlan={selectedPlan.key}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          isUpgrade={selectedPlan.isUpgrade}
          isDowngrade={selectedPlan.isDowngrade}
          isLoading={actionLoading !== null}
        />
      )}

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        periodEnd={billing?.subscription?.currentPeriodEnd}
        isLoading={actionLoading === 'cancel'}
      />

      <DowngradePreviewModal
        isOpen={showDowngradePreview}
        onClose={() => {
          setShowDowngradePreview(false);
          setDowngradeCheckData(null);
          setSelectedPlan(null);
        }}
        onConfirm={handleChangePlan}
        checkData={downgradeCheckData!}
        targetPlanName={selectedPlan?.name || ''}
        isLoading={actionLoading !== null && actionLoading.startsWith('change-')}
      />

      <DowngradeBlockedModal
        isOpen={showDowngradeModal}
        onClose={() => {
          setShowDowngradeModal(false);
          setDowngradeWarnings([]);
          setDowngradeMessage('');
        }}
        warnings={downgradeWarnings}
        message={downgradeMessage}
      />
    </div>
  );
};

export default BillingDashboardPage;
