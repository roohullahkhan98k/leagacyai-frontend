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
