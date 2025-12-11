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

