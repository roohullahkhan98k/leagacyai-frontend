import { toast } from 'react-toastify';

export interface FeatureErrorData {
  error: string;
  message: string;
  hasSubscription?: boolean;
  needsSubscription?: boolean;
  limitReached?: boolean;
  redirectToPricing?: boolean;
  limit?: number;
  currentUsage?: number;
  remaining?: number;
  plan?: string;
}

export interface FeatureErrorHandler {
  showSubscriptionModal: (data: FeatureErrorData) => void;
  showLimitModal: (data: FeatureErrorData) => void;
}

let errorHandler: FeatureErrorHandler | null = null;

export function setFeatureErrorHandler(handler: FeatureErrorHandler) {
  errorHandler = handler;
}

export function handleFeatureError(error: any, featureName?: string): boolean {
  // Check if it's a 403 error with subscription/limit data
  if (error?.response?.status === 403 || error?.status === 403) {
    const errorData: FeatureErrorData = error?.response?.data || error?.data || error;

    // No subscription
    if (errorData.needsSubscription || (!errorData.hasSubscription && errorData.redirectToPricing)) {
      if (errorHandler) {
        errorHandler.showSubscriptionModal({
          ...errorData,
          message: errorData.message || `You need an active subscription to use ${featureName || 'this feature'}. Please subscribe to continue.`
        });
      } else {
        toast.error(errorData.message || 'Subscription required');
      }
      return true;
    }

    // Limit reached
    if (errorData.limitReached || (errorData.hasSubscription && errorData.remaining === 0)) {
      if (errorHandler) {
        errorHandler.showLimitModal({
          ...errorData,
          message: errorData.message || `You have reached your ${featureName || 'feature'} limit. Upgrade your plan to continue.`
        });
      } else {
        toast.error(errorData.message || 'Limit reached');
      }
      return true;
    }
  }

  return false;
}

export function checkFeatureError(response: Response): Promise<FeatureErrorData | null> {
  if (response.status === 403) {
    return response.json().then((data: FeatureErrorData) => {
      if (data.needsSubscription || data.limitReached) {
        return data;
      }
      return null;
    }).catch(() => null);
  }
  return Promise.resolve(null);
}

