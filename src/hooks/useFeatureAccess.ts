import { useState, useEffect } from 'react';
import { getSubscriptionStatus, getUserUsage, type UsageResponse } from '../services/subscriptionService';

export interface FeatureAccess {
  hasAccess: boolean;
  loading: boolean;
  usage: UsageResponse['stats'][keyof UsageResponse['stats']] | null;
  hasSubscription: boolean;
  refresh: () => Promise<void>;
}

export function useFeatureAccess(featureName: keyof UsageResponse['stats']): FeatureAccess {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageResponse['stats'][keyof UsageResponse['stats']] | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  const checkAccess = async () => {
    setLoading(true);
    try {
      // Check subscription status
      const subscription = await getSubscriptionStatus();
      
      if (!subscription.hasActiveSubscription) {
        setHasAccess(false);
        setHasSubscription(false);
        setUsage(null);
        setLoading(false);
        return;
      }

      setHasSubscription(true);

      // Check usage
      const usageData = await getUserUsage();
      const featureUsage = usageData.stats[featureName];
      
      setUsage(featureUsage);
      setHasAccess(featureUsage.isUnlimited || featureUsage.remaining > 0);
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(false);
      setHasSubscription(false);
      setUsage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [featureName]);

  return { 
    hasAccess, 
    loading, 
    usage, 
    hasSubscription,
    refresh: checkAccess 
  };
}

