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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink
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
  type BillingDashboard,
  type Plan
} from '../services/subscriptionService';
import { toast } from 'react-toastify';

const BillingDashboardPage = () => {
  const { t } = useTranslation();
  const [billing, setBilling] = useState<BillingDashboard | null>(null);
  const [plans, setPlans] = useState<{ personal: Plan; premium: Plan; ultimate: Plan } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    fetchBilling();
    fetchPlans();
  }, []);

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

  const handleChangePlan = async (newPlan: 'personal' | 'premium' | 'ultimate') => {
    if (!billing?.subscription) return;
    
    if (billing.subscription.plan === newPlan) {
      toast.info(t('billing.alreadyOnPlan'));
      return;
    }

    if (!confirm(t('billing.confirmChangePlan'))) {
      return;
    }

    setActionLoading(`change-${newPlan}`);
    try {
      const data = await changePlan(newPlan);
      if (data.success) {
        toast.success(data.message || t('billing.planChanged'));
        await fetchBilling();
      }
    } catch (err: any) {
      toast.error(err.message || t('billing.changePlanError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm(t('billing.confirmCancel'))) {
      return;
    }

    setActionLoading('cancel');
    try {
      const data = await cancelSubscription();
      if (data.success) {
        toast.success(data.message || t('billing.cancelSuccess'));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('billing.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !billing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('billing.error')}</h2>
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
    <div className="w-full min-h-screen overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header Section */}
      <div className="relative w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50">
                <CreditCard className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t('billing.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('billing.subtitle')}
                </p>
              </div>
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
      </div>

      {/* Content */}
      <div className="relative w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {!billing?.hasSubscription ? (
          <Card className="border-2 border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-12 text-center">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('billing.noSubscription')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t('billing.noSubscriptionDescription')}
              </p>
              <Link to="/pricing">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {t('billing.viewPlans')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Current Subscription */}
            <Card className="border-2 border-blue-500/50 dark:border-blue-500/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  {t('billing.currentPlan')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {billing.subscription && (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
                            {billing.subscription.plan}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            billing.subscription.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          }`}>
                            {billing.subscription.status}
                          </span>
                        </div>
                        {billing.subscription.cancelAtPeriodEnd && (
                          <div className="flex items-center gap-2 mt-2 text-orange-600 dark:text-orange-400">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{t('billing.willCancelAtPeriodEnd')}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('billing.currentPeriod')}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(billing.subscription.currentPeriodStart)} - {formatDate(billing.subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>

                    {/* Plan Actions */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('billing.changePlan')}
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
                            <Card
                              key={planKey}
                              className={`border-2 transition-all ${
                                isCurrentPlan
                                  ? 'border-blue-500/50 dark:border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20'
                                  : 'border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                                    {plan.name}
                                  </h4>
                                  {isCurrentPlan && (
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                  )}
                                </div>
                                <p className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                  A${plan.price}
                                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/mo</span>
                                </p>
                                <Button
                                  size="sm"
                                  variant={isCurrentPlan ? 'outline' : 'primary'}
                                  className="w-full"
                                  onClick={() => handleChangePlan(planKey)}
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
                                    ? t('billing.currentPlan')
                                    : isUpgrade 
                                    ? t('billing.upgrade')
                                    : isDowngrade
                                    ? t('billing.downgrade')
                                    : t('billing.switch')
                                  }
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cancel/Resume Actions */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      {billing.subscription.cancelAtPeriodEnd ? (
                        <Button
                          variant="outline"
                          className="bg-green-50 dark:bg-green-900/20 border-green-500/50 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                          onClick={handleResume}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === 'resume' ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <RefreshCcw className="h-4 w-4 mr-2" />
                          )}
                          {t('billing.resumeSubscription')}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={handleCancel}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === 'cancel' ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          {t('billing.cancelSubscription')}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            {billing.paymentMethod && (
              <Card className="border-2 border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    {t('billing.paymentMethod')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {billing.paymentMethod.card && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {billing.paymentMethod.card.brand.toUpperCase()} ****{billing.paymentMethod.card.last4}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('billing.expires')}: {billing.paymentMethod.card.expMonth}/{billing.paymentMethod.card.expYear}
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
              <Card className="border-2 border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-500" />
                    {t('billing.upcomingInvoice')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {formatCurrency(billing.upcomingInvoice.amount, billing.upcomingInvoice.currency)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('billing.nextPayment')}: {formatDate(billing.upcomingInvoice.nextPaymentAttempt)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('billing.period')}: {formatDate(billing.upcomingInvoice.periodStart)} - {formatDate(billing.upcomingInvoice.periodEnd)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice History */}
            {billing.invoices && billing.invoices.length > 0 && (
              <Card className="border-2 border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-500" />
                    {t('billing.invoiceHistory')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {billing.invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {invoice.number}
                            </p>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
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
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
                              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
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
    </div>
  );
};

export default BillingDashboardPage;

