import { useState, useEffect } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import { 
  getSubscriptions, 
  getSubscription,
  updateSubscription,
  deleteSubscription,
  checkDowngrade,
  type Subscription,
  type GetSubscriptionsResponse,
  type CheckDowngradeResponse,
  type CleanupRequirement
} from '../../services/adminService';
import { toast } from 'react-toastify';
import { AlertTriangle } from 'lucide-react';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupData, setCleanupData] = useState<CheckDowngradeResponse | null>(null);
  const [checkingDowngrade, setCheckingDowngrade] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    plan_type: '',
    cancel_at_period_end: false
  });
  const [originalPlanType, setOriginalPlanType] = useState<string>('');

  useEffect(() => {
    fetchSubscriptions();
  }, [pagination.page, search, statusFilter, planFilter]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.planType = planFilter;

      const data: GetSubscriptionsResponse = await getSubscriptions(params);
      if (data.success) {
        setSubscriptions(data.subscriptions);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscription = async (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailModal(true);
    try {
      const data = await getSubscription(subscription.id);
      if (data.success) {
        setSelectedSubscription(data.subscription);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load subscription details');
    }
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditForm({
      status: subscription.status,
      plan_type: subscription.plan_type,
      cancel_at_period_end: subscription.cancel_at_period_end
    });
    setOriginalPlanType(subscription.plan_type);
    setShowEditModal(true);
  };

  const handlePlanTypeChange = async (newPlanType: string) => {
    if (!selectedSubscription) return;

    setEditForm(prev => ({ ...prev, plan_type: newPlanType }));

    // Check if it's a downgrade
    const planOrder = { personal: 1, premium: 2, ultimate: 3 };
    const currentPlanOrder = planOrder[originalPlanType as keyof typeof planOrder] || 0;
    const newPlanOrder = planOrder[newPlanType as keyof typeof planOrder] || 0;

    if (newPlanOrder < currentPlanOrder) {
      // It's a downgrade - check if allowed
      setCheckingDowngrade(true);
      try {
        const checkResult = await checkDowngrade(selectedSubscription.id, newPlanType);
        setCleanupData(checkResult);
        
        if (!checkResult.canDowngrade && checkResult.needsCleanup) {
          // Show cleanup requirements
          setShowCleanupModal(true);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to check downgrade status');
      } finally {
        setCheckingDowngrade(false);
      }
    } else {
      // Upgrade or same plan - clear any previous cleanup data
      setCleanupData(null);
      setShowCleanupModal(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedSubscription) return;

    // If there's cleanup required and user hasn't acknowledged, don't proceed
    if (cleanupData && !cleanupData.canDowngrade && cleanupData.needsCleanup) {
      toast.warning('Please review the cleanup requirements before proceeding');
      return;
    }

    try {
      const result = await updateSubscription(selectedSubscription.id, editForm);
      
      if (result.success) {
        toast.success('Subscription updated successfully');
        setShowEditModal(false);
        setShowCleanupModal(false);
        setSelectedSubscription(null);
        setCleanupData(null);
        fetchSubscriptions();
      }
    } catch (error: any) {
      // Check if it's a downgrade error with cleanup requirements
      if (error.isDowngradeError && error.needsCleanup) {
        setCleanupData({
          success: false,
          isDowngrade: true,
          currentPlan: originalPlanType,
          targetPlan: editForm.plan_type,
          canDowngrade: false,
          needsCleanup: true,
          cleanupRequired: true,
          message: error.message,
          warnings: error.cleanupRequired,
          featuresExceedingLimit: error.cleanupRequired.map((req: CleanupRequirement) => ({
            feature: req.feature,
            currentUsage: req.currentUsage,
            currentLimit: -1,
            newLimit: req.newLimit,
            overage: req.overage,
            needsCleanup: true
          }))
        });
        setShowCleanupModal(true);
        toast.error(error.message || 'Downgrade blocked: User exceeds new plan limits');
      } else {
        toast.error(error.message || 'Failed to update subscription');
      }
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteSubscription(id);
      toast.success('Subscription deleted successfully');
      fetchSubscriptions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subscription');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      canceled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      trialing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      past_due: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        statusColors[status] || statusColors.inactive
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planColors: Record<string, string> = {
      personal: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      premium: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
      ultimate: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold capitalize ${
        planColors[plan] || planColors.personal
      }`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  const getFeatureName = (feature: string) => {
    const featureNames: Record<string, string> = {
      voice_clones: 'Voice Clones',
      avatar_generations: 'Avatar Generations',
      memory_graph_operations: 'Memory Graph Operations',
      interview_sessions: 'Interview Sessions',
      multimedia_uploads: 'Multimedia Uploads'
    };
    return featureNames[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (subscription: Subscription) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {subscription.user?.username || subscription.user?.email || 'N/A'}
          </p>
          {subscription.user?.email && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subscription.user.email}</p>
          )}
        </div>
      )
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (subscription: Subscription) => getPlanBadge(subscription.plan_type)
    },
    {
      key: 'status',
      header: 'Status',
      render: (subscription: Subscription) => getStatusBadge(subscription.status)
    },
    {
      key: 'period',
      header: 'Billing Period',
      render: (subscription: Subscription) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-white">
            {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
          </p>
        </div>
      )
    },
    {
      key: 'canceled',
      header: 'Cancellation',
      render: (subscription: Subscription) => (
        <div className="text-sm">
          {subscription.cancel_at_period_end ? (
            <span className="text-orange-600 dark:text-orange-400">Cancels at period end</span>
          ) : subscription.canceled_at ? (
            <span className="text-red-600 dark:text-red-400">Canceled: {formatDate(subscription.canceled_at)}</span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Active</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (subscription: Subscription) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleViewSubscription(subscription);
            }}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleEditSubscription(subscription);
            }}
            title="Edit Subscription"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSubscription(subscription.id);
            }}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700"
            title="Delete Subscription"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage all platform subscriptions
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchSubscriptions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by email, username, name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="canceled">Canceled</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                </select>
              </div>
              <div>
                <select
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Plans</option>
                  <option value="personal">Personal</option>
                  <option value="premium">Premium</option>
                  <option value="ultimate">Ultimate</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={subscriptions}
              loading={loading}
              emptyMessage="No subscriptions found"
              onRowClick={handleViewSubscription}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subscriptions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm text-gray-600 dark:text-gray-400 px-4">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subscription Details</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedSubscription(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {selectedSubscription.user?.name || selectedSubscription.user?.username || selectedSubscription.user?.email || 'N/A'}
                  </p>
                  {selectedSubscription.user?.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSubscription.user.email}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan</label>
                    <div className="mt-1">{getPlanBadge(selectedSubscription.plan_type)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period Start</label>
                    <p className="text-gray-900 dark:text-white mt-1">{formatDate(selectedSubscription.current_period_start)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period End</label>
                    <p className="text-gray-900 dark:text-white mt-1">{formatDate(selectedSubscription.current_period_end)}</p>
                  </div>
                </div>

                {selectedSubscription.canceled_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Canceled At</label>
                    <p className="text-gray-900 dark:text-white mt-1">{formatDate(selectedSubscription.canceled_at)}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cancel at Period End</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {selectedSubscription.cancel_at_period_end ? 'Yes' : 'No'}
                  </p>
                </div>

                {selectedSubscription.stripe_subscription_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stripe Subscription ID</label>
                    <p className="text-gray-900 dark:text-white mt-1 font-mono text-sm">{selectedSubscription.stripe_subscription_id}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditSubscription(selectedSubscription);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Subscription
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedSubscription(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Subscription</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSubscription(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="canceled">Canceled</option>
                    <option value="trialing">Trialing</option>
                    <option value="past_due">Past Due</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Type
                    {checkingDowngrade && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Checking...)</span>
                    )}
                  </label>
                  <select
                    value={editForm.plan_type}
                    onChange={(e) => handlePlanTypeChange(e.target.value)}
                    disabled={checkingDowngrade}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="personal">Personal</option>
                    <option value="premium">Premium</option>
                    <option value="ultimate">Ultimate</option>
                  </select>
                  {cleanupData && !cleanupData.canDowngrade && cleanupData.needsCleanup && (
                    <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-orange-800 dark:text-orange-300">
                          <p className="font-medium mb-1">Downgrade requires cleanup</p>
                          <p className="text-xs">{cleanupData.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cancel_at_period_end"
                    checked={editForm.cancel_at_period_end}
                    onChange={(e) => setEditForm(prev => ({ ...prev, cancel_at_period_end: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="cancel_at_period_end" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cancel at period end
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="primary"
                    onClick={handleUpdateSubscription}
                    disabled={cleanupData && !cleanupData.canDowngrade && cleanupData.needsCleanup}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setShowCleanupModal(false);
                      setSelectedSubscription(null);
                      setCleanupData(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cleanup Requirements Modal */}
      {showCleanupModal && cleanupData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Downgrade Cleanup Required</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCleanupModal(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">
                    {cleanupData.message}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    The user must delete the following items before downgrading from <strong>{cleanupData.currentPlan}</strong> to <strong>{cleanupData.targetPlan}</strong>.
                  </p>
                </div>

                {cleanupData.warnings && cleanupData.warnings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Features Exceeding Limits:
                    </h3>
                    <div className="space-y-3">
                      {cleanupData.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {getFeatureName(warning.feature)}
                            </h4>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              Delete {warning.overage} items
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Current Usage:</span>
                              <span className="ml-2 font-semibold text-gray-900 dark:text-white">{warning.currentUsage}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">New Limit:</span>
                              <span className="ml-2 font-semibold text-gray-900 dark:text-white">{warning.newLimit}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Overage:</span>
                              <span className="ml-2 font-semibold text-red-600 dark:text-red-400">{warning.overage}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{warning.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cleanupData.featuresWithinLimit && cleanupData.featuresWithinLimit.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Features Within Limits:
                    </h3>
                    <div className="space-y-2">
                      {cleanupData.featuresWithinLimit.map((feature, index) => (
                        <div
                          key={index}
                          className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {getFeatureName(feature.feature)}
                            </span>
                            <span className="text-sm text-green-600 dark:text-green-400">
                              {feature.currentUsage} / {feature.newLimit === -1 ? 'Unlimited' : feature.newLimit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cleanupData.totalOverage && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">Total Items to Delete:</span>
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {cleanupData.totalOverage}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCleanupModal(false);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCleanupModal(false);
                      setShowEditModal(true);
                    }}
                  >
                    Back to Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default SubscriptionsPage;

