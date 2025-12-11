import { useState, useEffect } from 'react';
import SubscriptionRequiredModal from './modals/SubscriptionRequiredModal';
import LimitReachedModal from './modals/LimitReachedModal';
import { setFeatureErrorHandler, type FeatureErrorData } from '../utils/featureErrorHandler';

const FeatureErrorHandler = () => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<FeatureErrorData | null>(null);
  const [limitData, setLimitData] = useState<FeatureErrorData | null>(null);

  useEffect(() => {
    // Register error handler
    setFeatureErrorHandler({
      showSubscriptionModal: (data: FeatureErrorData) => {
        setSubscriptionData(data);
        setShowSubscriptionModal(true);
      },
      showLimitModal: (data: FeatureErrorData) => {
        setLimitData(data);
        setShowLimitModal(true);
      }
    });
  }, []);

  return (
    <>
      <SubscriptionRequiredModal
        isOpen={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          setSubscriptionData(null);
        }}
        message={subscriptionData?.message || 'You need an active subscription to use this feature.'}
        featureName={subscriptionData?.error}
      />
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => {
          setShowLimitModal(false);
          setLimitData(null);
        }}
        errorData={{
          message: limitData?.message || 'You have reached your limit.',
          limit: limitData?.limit || 0,
          currentUsage: limitData?.currentUsage || 0,
          remaining: limitData?.remaining || 0,
          plan: limitData?.plan || 'free'
        }}
        featureName={limitData?.error}
      />
    </>
  );
};

export default FeatureErrorHandler;

