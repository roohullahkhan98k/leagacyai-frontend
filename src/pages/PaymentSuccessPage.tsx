import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, ArrowRight, Home, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { getSubscriptionStatus, type SubscriptionStatus } from '../services/subscriptionService';

const PaymentSuccessPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    // Fetch updated subscription status
    const fetchSubscription = async () => {
      try {
        const status = await getSubscriptionStatus();
        setSubscription(status);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return (
    <div className="w-full min-h-screen overflow-hidden flex items-center justify-center">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-2 border-green-500/50 dark:border-green-500/50 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                  <div className="relative p-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-2xl">
                    <CheckCircle2 className="h-16 w-16" />
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Payment Successful
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Payment Successful!
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                Thank you for your subscription
              </p>

              {/* Description */}
              <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6 mb-8 border border-green-200/50 dark:border-green-800/50">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your payment has been processed successfully. Your subscription is now active and you have full access to all features included in your plan.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  You will receive a confirmation email shortly with all the details of your subscription.
                </p>
                
                {/* Subscription Details */}
                {loading ? (
                  <div className="mt-6 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading subscription details...</span>
                  </div>
                ) : subscription && subscription.hasActiveSubscription ? (
                  <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
                    <div className="space-y-2 text-left">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Plan:</strong> <span className="capitalize">{subscription.plan}</span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Status:</strong> <span className="capitalize">{subscription.status}</span>
                      </p>
                      {subscription.currentPeriodEnd && (
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>Next billing:</strong> {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      )}
                      {subscription.cancelAtPeriodEnd && (
                        <p className="text-orange-600 dark:text-orange-400">
                          <strong>Note:</strong> Your subscription will cancel at the end of the current period.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl shadow-green-500/50 hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Go to Home
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  onClick={() => navigate(-1)}
                >
                  View Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need help? <Link to="/" className="text-green-600 dark:text-green-400 hover:underline">Contact Support</Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

