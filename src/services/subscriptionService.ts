import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.legacyai.com.au';

// Get user's JWT token from storage
function getAuthToken(): string | null {
  return authService.getToken();
}

export interface Plan {
  name: string;
  price: number;
  features: string[];
}

export interface PlansResponse {
  success: boolean;
  plans?: {
    personal: Plan;
    premium: Plan;
    ultimate: Plan;
  };
  error?: string;
}

export interface SubscriptionStatus {
  plan: 'free' | 'personal' | 'premium' | 'ultimate';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  hasActiveSubscription: boolean;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: SubscriptionStatus;
  error?: string;
}

export interface CheckoutResponse {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Fetch available subscription plans
 */
export async function getPlans(): Promise<PlansResponse> {
  try {
    const response = await fetch(`${API_URL}/api/subscription/plans`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

/**
 * Create checkout session and redirect to Stripe
 */
export async function createCheckout(planType: 'personal' | 'premium' | 'ultimate'): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in to subscribe');
  }

  try {
    const response = await fetch(`${API_URL}/api/subscription/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planType })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data: CheckoutResponse = await response.json();
    
    if (data.success && data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      throw new Error(data.error || 'Failed to create checkout session');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}

/**
 * Get user's current subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const token = getAuthToken();
  if (!token) {
    return { plan: 'free', status: 'inactive', hasActiveSubscription: false };
  }

  try {
    const response = await fetch(`${API_URL}/api/subscription/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // If unauthorized or not found, return free plan
      if (response.status === 401 || response.status === 404) {
        return { plan: 'free', status: 'inactive', hasActiveSubscription: false };
      }
      throw new Error(`Failed to fetch subscription status: ${response.statusText}`);
    }

    const data: SubscriptionResponse = await response.json();
    return data.subscription || { plan: 'free', status: 'inactive', hasActiveSubscription: false };
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return { plan: 'free', status: 'inactive', hasActiveSubscription: false };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<{ success: boolean; message?: string; error?: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User must be logged in');
  }

  try {
    const response = await fetch(`${API_URL}/api/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to cancel subscription' }));
      throw new Error(errorData.error || 'Failed to cancel subscription');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
}

