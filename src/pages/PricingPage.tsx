import { useState, useEffect } from 'react';
import { Check, Sparkles, ArrowRight, Zap, Crown, Rocket, Loader2, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { getPlans, createCheckout } from '../services/subscriptionService';
import { toast } from 'react-toastify';

const PricingPage = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    // Fetch plans from API
    const fetchPlans = async () => {
      try {
        const response = await getPlans();
        if (response.success && response.plans) {
          // Map API plans to our UI format
          const mappedPlans = [
            {
              name: 'Personal',
              planType: 'personal' as const,
              price: `A$${response.plans.personal.price}`,
              period: '/month',
              icon: <Zap className="h-8 w-8" />,
              gradient: 'from-blue-500 to-cyan-500',
              bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
              borderGradient: 'from-blue-500/50 to-cyan-500/50',
              features: response.plans.personal.features,
              popular: false
            },
            {
              name: 'Premium',
              planType: 'premium' as const,
              price: `A$${response.plans.premium.price}`,
              period: '/month',
              icon: <Crown className="h-8 w-8" />,
              gradient: 'from-purple-500 to-pink-500',
              bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
              borderGradient: 'from-purple-500/50 to-pink-500/50',
              features: response.plans.premium.features,
              popular: true
            },
            {
              name: 'Ultimate',
              planType: 'ultimate' as const,
              price: `A$${response.plans.ultimate.price}`,
              period: '/month',
              icon: <Rocket className="h-8 w-8" />,
              gradient: 'from-orange-500 to-red-500',
              bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
              borderGradient: 'from-orange-500/50 to-red-500/50',
              features: response.plans.ultimate.features,
              popular: false
            }
          ];
          setPlans(mappedPlans);
        } else {
          // Fallback to hardcoded plans if API fails
          setPlans(getDefaultPlans());
          setError('Failed to load plans from server. Showing default plans.');
        }
      } catch (err) {
        console.error('Error loading plans:', err);
        // Fallback to hardcoded plans
        setPlans(getDefaultPlans());
        setError('Failed to load plans. Showing default plans.');
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const getDefaultPlans = () => [
    {
      name: 'Personal',
      planType: 'personal' as const,
      price: 'A$9.99',
      period: '/month',
      icon: <Zap className="h-8 w-8" />,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      borderGradient: 'from-blue-500/50 to-cyan-500/50',
      features: [
        'Basic AI chat + memory',
        'Limited monthly avatar generation (5 per month)',
        'Basic storage package',
        'Standard support'
      ],
      popular: false
    },
    {
      name: 'Premium',
      planType: 'premium' as const,
      price: 'A$24.99',
      period: '/month',
      icon: <Crown className="h-8 w-8" />,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
      borderGradient: 'from-purple-500/50 to-pink-500/50',
      features: [
        'Everything in Personal',
        'Higher avatar generation limit (20 per month)',
        'Full memory graph',
        'Advanced AI features',
        'Priority processing',
        'Larger storage'
      ],
      popular: true
    },
    {
      name: 'Ultimate',
      planType: 'ultimate' as const,
      price: 'A$44.99',
      period: '/month',
      icon: <Rocket className="h-8 w-8" />,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
      borderGradient: 'from-orange-500/50 to-red-500/50',
      features: [
        'Everything in Premium',
        'Unlimited avatar generation',
        'Highest priority GPU queue',
        'Full access to all features',
        'Maximum storage',
        'Future premium modules included'
      ],
      popular: false
    }
  ];

  const handleSubscribe = async (planType: 'personal' | 'premium' | 'ultimate') => {
    if (!isAuthenticated) {
      toast.error('Please log in to subscribe');
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    setLoading(prev => ({ ...prev, [planType]: true }));
    setError(null);

    try {
      await createCheckout(planType);
      // User will be redirected to Stripe, so code below won't execute
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start checkout';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(prev => ({ ...prev, [planType]: false }));
    }
  };

  return (
    <div className="w-full min-h-screen overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header Section */}
      <div className="relative w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('pricing.badge')}
            </span>
          </div>

          {/* Icon and Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('pricing.title')}
              </span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="relative w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="relative w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loadingPlans ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">{t('pricing.loading')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg">
                    {t('pricing.mostPopular')}
                  </div>
                </div>
              )}
              
              <Card
                className={`h-full border-2 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col ${
                  plan.popular
                    ? 'border-purple-500/50 dark:border-purple-500/50 shadow-xl shadow-purple-500/20'
                    : 'border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <CardContent className="p-6 lg:p-8 flex flex-col flex-grow">
                  {/* Plan Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.gradient} text-white mb-6 shadow-lg`}>
                    {plan.icon}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">
                      {plan.period}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 mt-0.5 p-1 rounded-full bg-gradient-to-br ${plan.gradient} text-white`}>
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm lg:text-base">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buttons - Always at bottom */}
                  <div className="mt-auto pt-4 space-y-3">
                    <Button
                      size="lg"
                      className={`w-full text-base lg:text-lg py-3 lg:py-4 bg-gradient-to-r ${plan.gradient} hover:shadow-xl text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                      style={{
                        boxShadow: plan.popular 
                          ? '0 20px 25px -5px rgba(168, 85, 247, 0.4), 0 10px 10px -5px rgba(168, 85, 247, 0.2)' 
                          : undefined
                      }}
                      onClick={() => handleSubscribe(plan.planType)}
                      disabled={loading[plan.planType]}
                    >
                      {loading[plan.planType] ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {t('pricing.processing')}
                        </>
                      ) : (
                        <>
                          {t('pricing.getStarted')}
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    {isAuthenticated && (
                      <Link to="/billing" className="block">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full text-base lg:text-lg py-3 lg:py-4 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          <CreditCard className="h-5 w-5 mr-2" />
                          View Billing Dashboard
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* FAQ or Additional Info Section */}
      <div className="relative w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {t('pricing.faqTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t('pricing.faq1.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pricing.faq1.answer')}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t('pricing.faq2.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pricing.faq2.answer')}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t('pricing.faq3.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pricing.faq3.answer')}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t('pricing.faq4.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pricing.faq4.answer')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="border-2 border-blue-500/50 dark:border-blue-500/50 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('pricing.ctaTitle')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {t('pricing.ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button
                  size="lg"
                  className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  {t('pricing.backToHome')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingPage;
