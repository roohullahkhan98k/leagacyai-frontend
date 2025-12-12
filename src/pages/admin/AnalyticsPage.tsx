import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Package, 
  Activity, 
  RefreshCw,
  Mic,
  User,
  BrainCircuit,
  Image,
  FileText
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import {
  getDashboardAnalytics,
  getPackageAnalytics,
  getUsageAnalytics,
  getUserActivityAnalytics,
  type DashboardAnalyticsResponse,
  type PackageAnalyticsResponse,
  type UsageAnalyticsResponse,
  type UserActivityResponse
} from '../../services/adminService';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type Period = '7d' | '30d' | '90d' | '1y' | 'all';
type ActiveTab = 'dashboard' | 'packages' | 'usage' | 'users';

const COLORS = {
  primary: '#8b5cf6',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  personal: '#3b82f6',
  premium: '#8b5cf6',
  ultimate: '#f59e0b'
};

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardAnalyticsResponse['data'] | null>(null);
  const [packageData, setPackageData] = useState<PackageAnalyticsResponse['data'] | null>(null);
  const [usageData, setUsageData] = useState<UsageAnalyticsResponse['data'] | null>(null);
  const [userActivityData, setUserActivityData] = useState<UserActivityResponse['data'] | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'dashboard':
          const dashboard = await getDashboardAnalytics(period);
          setDashboardData(dashboard.data);
          break;
        case 'packages':
          const packages = await getPackageAnalytics(period);
          setPackageData(packages.data);
          break;
        case 'usage':
          const usage = await getUsageAnalytics(period);
          setUsageData(usage.data);
          break;
        case 'users':
          const users = await getUserActivityAnalytics(period);
          setUserActivityData(users.data);
          break;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Define all 5 features
  const ALL_FEATURES = [
    { key: 'voice_clones', name: 'Voice Clones', icon: Mic, color: 'blue' },
    { key: 'avatar_generations', name: 'Avatar Generations', icon: User, color: 'purple' },
    { key: 'memory_graph_operations', name: 'Memory Graph Operations', icon: FileText, color: 'green' },
    { key: 'interview_sessions', name: 'Interview Sessions', icon: BrainCircuit, color: 'orange' },
    { key: 'multimedia_uploads', name: 'Multimedia Uploads', icon: Image, color: 'pink' }
  ];

  const getFeatureStats = (featureKey: string) => {
    if (!usageData?.statistics) return { totalUsage: 0, uniqueUsers: 0, averageUsage: 0 };
    return usageData.statistics[featureKey as keyof typeof usageData.statistics] || { totalUsage: 0, uniqueUsers: 0, averageUsage: 0 };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive insights into platform usage and performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'packages', label: 'Packages', icon: Package },
              { key: 'usage', label: 'Usage', icon: Activity },
              { key: 'users', label: 'User Activity', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as ActiveTab)}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && dashboardData && (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {formatNumber(dashboardData.overview?.totalUsers || 0)}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            +{dashboardData.overview?.newUsers || 0} new
                          </p>
                        </div>
                        <Users className="h-12 w-12 text-blue-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {formatNumber(dashboardData.overview?.activeSubscriptions || 0)}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            +{dashboardData.overview?.newSubscriptions || 0} new
                          </p>
                        </div>
                        <Package className="h-12 w-12 text-purple-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Canceled Subscriptions</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                            {formatNumber((dashboardData.subscriptions?.byStatus?.canceled || 0) + (dashboardData.subscriptions?.byStatus?.inactive || 0))}
                          </p>
                        </div>
                        <Package className="h-12 w-12 text-red-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Growth Chart */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            stroke="#6b7280"
                            className="dark:stroke-gray-400"
                          />
                          <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#374151' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke={COLORS.primary} 
                            strokeWidth={2}
                            dot={{ fill: COLORS.primary, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Subscription Breakdown */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription Breakdown</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Personal', value: dashboardData.subscriptions?.byPlan?.personal?.active || 0, color: COLORS.personal },
                              { name: 'Premium', value: dashboardData.subscriptions?.byPlan?.premium?.active || 0, color: COLORS.premium },
                              { name: 'Ultimate', value: dashboardData.subscriptions?.byPlan?.ultimate?.active || 0, color: COLORS.ultimate },
                              { name: 'Canceled', value: (dashboardData.subscriptions?.byStatus?.canceled || 0) + (dashboardData.subscriptions?.byStatus?.inactive || 0), color: COLORS.danger }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Personal', value: dashboardData.subscriptions?.byPlan?.personal?.active || 0, color: COLORS.personal },
                              { name: 'Premium', value: dashboardData.subscriptions?.byPlan?.premium?.active || 0, color: COLORS.premium },
                              { name: 'Ultimate', value: dashboardData.subscriptions?.byPlan?.ultimate?.active || 0, color: COLORS.ultimate },
                              { name: 'Canceled', value: (dashboardData.subscriptions?.byStatus?.canceled || 0) + (dashboardData.subscriptions?.byStatus?.inactive || 0), color: COLORS.danger }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'packages' && packageData && (() => {
              // Merge growth data by date
              const allDates = new Set([
                ...(packageData.growthByPlan?.personal || []).map(d => d.date),
                ...(packageData.growthByPlan?.premium || []).map(d => d.date),
                ...(packageData.growthByPlan?.ultimate || []).map(d => d.date)
              ]);
              
              const mergedData = Array.from(allDates).sort().map(date => {
                const personal = (packageData.growthByPlan?.personal || []).find(d => d.date === date)?.count || 0;
                const premium = (packageData.growthByPlan?.premium || []).find(d => d.date === date)?.count || 0;
                const ultimate = (packageData.growthByPlan?.ultimate || []).find(d => d.date === date)?.count || 0;
                return { date, Personal: personal, Premium: premium, Ultimate: ultimate };
              });

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscriptions</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatNumber(packageData.statistics?.total || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {formatNumber(packageData.statistics?.byStatus?.active || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Canceled</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {formatNumber(packageData.statistics?.byStatus?.canceled || 0)}
                      </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Growth by Plan</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={mergedData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            stroke="#6b7280"
                            className="dark:stroke-gray-400"
                          />
                          <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#374151' }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="Personal" 
                            name="Personal"
                            stroke={COLORS.personal}
                            strokeWidth={2}
                            dot={{ fill: COLORS.personal, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Premium" 
                            name="Premium"
                            stroke={COLORS.premium}
                            strokeWidth={2}
                            dot={{ fill: COLORS.premium, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Ultimate" 
                            name="Ultimate"
                            stroke={COLORS.ultimate}
                            strokeWidth={2}
                            dot={{ fill: COLORS.ultimate, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {ALL_FEATURES.map((feature) => {
                    const stats = getFeatureStats(feature.key);
                    const Icon = feature.icon;
                    const colorClasses = {
                      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
                      pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                    };
                    return (
                      <Card key={feature.key}>
                        <CardContent className="p-6">
                          <div className={`p-3 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <Icon className="h-5 w-5" />
                              <span className="font-medium text-sm">{feature.name}</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatNumber(stats.totalUsage || 0)}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {stats.uniqueUsers || 0} active users
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Usage Chart */}
                {usageData && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Usage Comparison</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={ALL_FEATURES.map(feature => {
                          const stats = getFeatureStats(feature.key);
                          return {
                            name: feature.name,
                            total: stats.totalUsage || 0,
                            users: stats.uniqueUsers || 0
                          };
                        })}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                          <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-gray-400" angle={-45} textAnchor="end" height={100} />
                          <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" fill={COLORS.primary} name="Total Usage" />
                          <Bar dataKey="users" fill={COLORS.secondary} name="Unique Users" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Interview Sessions */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BrainCircuit className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Users by Interview Sessions</h3>
                      </div>
                      <div className="space-y-3">
                        {(userActivityData?.topUsersByInterviews || []).length > 0 ? (
                          (userActivityData.topUsersByInterviews || []).slice(0, 10).map((user, index) => (
                            <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{user.user?.username || 'N/A'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.user?.email || ''}</p>
                                </div>
                              </div>
                              <span className="font-bold text-orange-600 dark:text-orange-400">{user.count || 0}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No users found</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Memory Graph Operations */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Users by Memory Graph Operations</h3>
                      </div>
                      <div className="space-y-3">
                        {(userActivityData?.topUsersByMemories || []).length > 0 ? (
                          (userActivityData.topUsersByMemories || []).slice(0, 10).map((user, index) => (
                            <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{user.user?.username || 'N/A'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.user?.email || ''}</p>
                                </div>
                              </div>
                              <span className="font-bold text-green-600 dark:text-green-400">{user.count || 0}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No users found</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Voice Clones */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Users by Voice Clones</h3>
                      </div>
                      <div className="space-y-3">
                        {(userActivityData?.topUsersByVoices || []).length > 0 ? (
                          (userActivityData.topUsersByVoices || []).slice(0, 10).map((user, index) => (
                            <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{user.user?.username || 'N/A'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.user?.email || ''}</p>
                                </div>
                              </div>
                              <span className="font-bold text-blue-600 dark:text-blue-400">{user.count || 0}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No users found</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Avatar Generations */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Users by Avatar Generations</h3>
                      </div>
                      <div className="space-y-3">
                        {(userActivityData?.topUsersByAvatars || []).length > 0 ? (
                          (userActivityData.topUsersByAvatars || []).slice(0, 10).map((user, index) => (
                            <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{user.user?.username || 'N/A'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.user?.email || ''}</p>
                                </div>
                              </div>
                              <span className="font-bold text-purple-600 dark:text-purple-400">{user.count || 0}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No users found</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Multimedia Uploads */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Image className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Users by Multimedia Uploads</h3>
                      </div>
                      <div className="space-y-3">
                        {(userActivityData?.topUsersByMultimedia || []).length > 0 ? (
                          (userActivityData.topUsersByMultimedia || []).slice(0, 10).map((user, index) => (
                            <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{user.user?.username || 'N/A'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.user?.email || ''}</p>
                                </div>
                              </div>
                              <span className="font-bold text-pink-600 dark:text-pink-400">{user.count || 0}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No users found</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;

