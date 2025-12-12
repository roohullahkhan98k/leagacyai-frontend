import { authService } from './authService';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function getAuthToken(): string | null {
  return authService.getToken();
}

export interface FeatureLimit {
  limit_value: number;
  limit_type: string;
  id: string;
}

export interface PlanLimits {
  voice_clones: FeatureLimit;
  avatar_generations: FeatureLimit;
  memory_graph_operations: FeatureLimit;
  interview_sessions: FeatureLimit;
  multimedia_uploads: FeatureLimit;
}

export interface AllLimitsResponse {
  success: boolean;
  limits: {
    personal: PlanLimits;
    premium: PlanLimits;
    ultimate: PlanLimits;
  };
  raw?: any[];
}

export interface UpdateLimitRequest {
  planType: 'personal' | 'premium' | 'ultimate';
  featureName: 'voice_clones' | 'avatar_generations' | 'memory_graph_operations' | 'interview_sessions' | 'multimedia_uploads';
  limitValue: number;
  limitType?: string;
}

export interface UpdateLimitResponse {
  success: boolean;
  message: string;
  limit: {
    plan_type: string;
    feature_name: string;
    limit_value: number;
    limit_type: string;
    id: string;
  };
}

export interface BulkUpdateRequest {
  limits: UpdateLimitRequest[];
}

export interface BulkUpdateResponse {
  success: boolean;
  message: string;
  updated: Array<{
    plan_type: string;
    feature_name: string;
    limit_value: number;
    limit_type: string;
  }>;
  errors: any[];
}

export interface ResetLimitsResponse {
  success: boolean;
  message: string;
  limits: any[];
}

// User Management Interfaces
export interface UserSubscription {
  hasSubscription: boolean;
  plan?: string;
  status?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  avatar?: string;
  stripe_customer_id?: string;
  subscription?: UserSubscription;
}

export interface UserStatistics {
  interviews: number;
  memories: number;
  voices: number;
  avatars: number;
  hasSubscription: boolean;
  subscription?: {
    plan: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    stripe_subscription_id?: string;
  };
}

export interface GetUsersResponse {
  success: boolean;
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetUserResponse {
  success: boolean;
  user: AdminUser;
  statistics: UserStatistics;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  avatar?: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
  deleted: {
    user: boolean;
    interviews: number;
    memories: number;
    voices: number;
    generatedAudio: number;
    avatars: number;
    multimedia: number;
    multimediaNodes: number;
    multimediaLinks: number;
    subscriptions: number;
    usage: number;
  };
}

/**
 * Get all feature limits for all plans
 */
export async function getAllLimits(): Promise<AllLimitsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/subscription/admin/limits`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch limits' }));
      throw new Error(errorData.error || 'Failed to fetch limits');
    }

    const data: AllLimitsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching limits:', error);
    throw error;
  }
}

/**
 * Update a single feature limit
 */
export async function updateLimit(request: UpdateLimitRequest): Promise<UpdateLimitResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/subscription/admin/limits`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update limit' }));
      throw new Error(errorData.error || 'Failed to update limit');
    }

    const data: UpdateLimitResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating limit:', error);
    throw error;
  }
}

/**
 * Update multiple limits at once
 */
export async function bulkUpdateLimits(request: BulkUpdateRequest): Promise<BulkUpdateResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/subscription/admin/limits/bulk`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update limits' }));
      throw new Error(errorData.error || 'Failed to update limits');
    }

    const data: BulkUpdateResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error bulk updating limits:', error);
    throw error;
  }
}

/**
 * Reset all limits to defaults
 */
export async function resetLimitsToDefaults(): Promise<ResetLimitsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/subscription/admin/limits/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to reset limits' }));
      throw new Error(errorData.error || 'Failed to reset limits');
    }

    const data: ResetLimitsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error resetting limits:', error);
    throw error;
  }
}

// User Management Functions

/**
 * Get all users with pagination and filters
 */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}): Promise<GetUsersResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await fetch(`${API_URL}/api/admin/users?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch users' }));
      throw new Error(errorData.error || 'Failed to fetch users');
    }

    const data: GetUsersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get single user with statistics
 */
export async function getUser(id: string): Promise<GetUserResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch user' }));
      throw new Error(errorData.error || 'Failed to fetch user');
    }

    const data: GetUserResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserRequest): Promise<{ success: boolean; user: AdminUser }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create user' }));
      throw new Error(errorData.error || 'Failed to create user');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update a user
 */
export async function updateUser(id: string, userData: UpdateUserRequest): Promise<{ success: boolean; user: AdminUser }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update user' }));
      throw new Error(errorData.error || 'Failed to update user');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<DeleteUserResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete user' }));
      throw new Error(errorData.error || 'Failed to delete user');
    }

    const data: DeleteUserResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Analytics Interfaces
export interface TimeSeriesDataPoint {
  date: string;
  count: number;
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  data: {
    overview: {
      totalUsers: number;
      activeUsers: number;
      newUsers: number;
      totalInterviews: number;
      completedInterviews: number;
      newInterviews: number;
      totalMemories: number;
      totalVoices: number;
      totalAvatars: number;
      totalMultimedia: number;
      totalSubscriptions: number;
      activeSubscriptions: number;
      newSubscriptions: number;
    };
    subscriptions: {
      total: number;
      active: number;
      byPlan: {
        personal: { total: number; active: number };
        premium: { total: number; active: number };
        ultimate: { total: number; active: number };
      };
      growth: TimeSeriesDataPoint[];
    };
    userGrowth: TimeSeriesDataPoint[];
    featureUsage: {
      voice_clones: { totalUsage: number; activeUsers: number };
      avatar_generations: { totalUsage: number; activeUsers: number };
      interview_sessions: { totalUsage: number; activeUsers: number };
    };
    period: string;
  };
}

export interface PackageAnalyticsResponse {
  success: boolean;
  data: {
    subscriptions: {
      personal: any[];
      premium: any[];
      ultimate: any[];
    };
    statistics: {
      total: number;
      byPlan: { personal: number; premium: number; ultimate: number };
      byStatus: { active: number; inactive: number; canceled: number; trialing: number; past_due: number };
      recentPurchases: any[];
    };
    growthByPlan: {
      personal: TimeSeriesDataPoint[];
      premium: TimeSeriesDataPoint[];
      ultimate: TimeSeriesDataPoint[];
    };
    period: string;
  };
}

export interface UsageAnalyticsResponse {
  success: boolean;
  data: {
    byFeature: {
      voice_clones: any[];
      avatar_generations: any[];
      interview_sessions: any[];
    };
    statistics: {
      voice_clones: { totalUsage: number; uniqueUsers: number; averageUsage: number; topUsers: any[] };
      avatar_generations: { totalUsage: number; uniqueUsers: number; averageUsage: number; topUsers: any[] };
      interview_sessions: { totalUsage: number; uniqueUsers: number; averageUsage: number; topUsers: any[] };
    };
    usageOverTime: {
      voice_clones: TimeSeriesDataPoint[];
      avatar_generations: TimeSeriesDataPoint[];
      interview_sessions: TimeSeriesDataPoint[];
    };
    period: string;
  };
}

export interface UserActivityResponse {
  success: boolean;
  data: {
    topUsersByInterviews: any[];
    topUsersByMemories: any[];
    topUsersByVoices: any[];
    topUsersByAvatars: any[];
    topUsersByMultimedia: any[];
    period: string;
  };
}

export interface ContentAnalyticsResponse {
  success: boolean;
  data: {
    interviews: {
      total: number;
      completed: number;
      active: number;
      recent: number;
      growth: TimeSeriesDataPoint[];
    };
    memories: {
      total: number;
      recent: number;
      byCategory: {
        withPerson: number;
        withEvent: number;
        withTags: number;
        withMedia: number;
      };
      growth: TimeSeriesDataPoint[];
    };
    voices: {
      total: number;
      recent: number;
      growth: TimeSeriesDataPoint[];
    };
    avatars: {
      total: number;
      recent: number;
      animations: number;
      growth: TimeSeriesDataPoint[];
    };
    multimedia: {
      total: number;
      recent: number;
      byType: Array<{ file_type: string; count: number; total_size: number }>;
      nodes: number;
      links: number;
      growth: TimeSeriesDataPoint[];
    };
    period: string;
  };
}

// Subscription Management Interfaces
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    username: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface GetSubscriptionsResponse {
  success: boolean;
  subscriptions: Subscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetSubscriptionResponse {
  success: boolean;
  subscription: Subscription;
}

export interface UpdateSubscriptionRequest {
  status?: string;
  plan_type?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface CleanupRequirement {
  feature: string;
  currentUsage: number;
  newLimit: number;
  overage: number;
  message: string;
}

export interface CheckDowngradeResponse {
  success: boolean;
  isDowngrade: boolean;
  currentPlan: string;
  targetPlan: string;
  canDowngrade: boolean;
  needsCleanup: boolean;
  cleanupRequired: boolean;
  message: string;
  warnings?: CleanupRequirement[];
  featuresExceedingLimit?: Array<{
    feature: string;
    currentUsage: number;
    currentLimit: number;
    newLimit: number;
    overage: number;
    needsCleanup: boolean;
  }>;
  featuresWithinLimit?: Array<{
    feature: string;
    currentUsage: number;
    currentLimit: number;
    newLimit: number;
    overage: number;
    needsCleanup: boolean;
  }>;
  totalOverage?: number;
}

export interface UpdateSubscriptionErrorResponse {
  success: false;
  error: string;
  message: string;
  needsCleanup: boolean;
  cleanupRequired: CleanupRequirement[];
  isDowngradeError?: boolean;
}

// Analytics API Functions
export async function getDashboardAnalytics(period: string = '30d'): Promise<DashboardAnalyticsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/analytics/dashboard?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch dashboard analytics' }));
      throw new Error(errorData.error || 'Failed to fetch dashboard analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
}

export async function getPackageAnalytics(period: string = '30d'): Promise<PackageAnalyticsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/analytics/packages?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch package analytics' }));
      throw new Error(errorData.error || 'Failed to fetch package analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching package analytics:', error);
    throw error;
  }
}

export async function getUsageAnalytics(period: string = '30d'): Promise<UsageAnalyticsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/analytics/usage?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch usage analytics' }));
      throw new Error(errorData.error || 'Failed to fetch usage analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    throw error;
  }
}

export async function getUserActivityAnalytics(period: string = '30d'): Promise<UserActivityResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/analytics/users-activity?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch user activity analytics' }));
      throw new Error(errorData.error || 'Failed to fetch user activity analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user activity analytics:', error);
    throw error;
  }
}

export async function getContentAnalytics(period: string = '30d'): Promise<ContentAnalyticsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/analytics/content?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch content analytics' }));
      throw new Error(errorData.error || 'Failed to fetch content analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    throw error;
  }
}

// Subscription Management API Functions
export async function getSubscriptions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  planType?: string;
  search?: string;
}): Promise<GetSubscriptionsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.planType) queryParams.append('planType', params.planType);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${API_URL}/api/admin/subscriptions?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch subscriptions' }));
      throw new Error(errorData.error || 'Failed to fetch subscriptions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
}

export async function getSubscription(id: string): Promise<GetSubscriptionResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/subscriptions/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch subscription' }));
      throw new Error(errorData.error || 'Failed to fetch subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}

export async function checkDowngrade(id: string, planType: string): Promise<CheckDowngradeResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/subscriptions/${id}/check-downgrade?planType=${planType}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to check downgrade' }));
      throw new Error(errorData.error || 'Failed to check downgrade');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking downgrade:', error);
    throw error;
  }
}

export async function updateSubscription(id: string, data: UpdateSubscriptionRequest): Promise<GetSubscriptionResponse | UpdateSubscriptionErrorResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/subscriptions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Check if it's a downgrade error with cleanup requirements
      if (response.status === 403 && responseData.needsCleanup) {
        throw {
          ...responseData,
          isDowngradeError: true
        } as UpdateSubscriptionErrorResponse & { isDowngradeError: boolean };
      }
      throw new Error(responseData.error || responseData.message || 'Failed to update subscription');
    }

    return responseData;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function deleteSubscription(id: string): Promise<{ success: boolean; message: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/subscriptions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete subscription' }));
      throw new Error(errorData.error || 'Failed to delete subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
}