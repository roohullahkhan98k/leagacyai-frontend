import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BrainCircuit, Network, Mic, User, Image, Users, Zap, Shield, Globe, Sparkles, TrendingUp, CheckCircle2, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';

const HomePage = () => {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <BrainCircuit className="h-10 w-10" />,
      title: t('home.aiInterviewEngine'),
      description: t('home.aiInterviewDescription'),
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      link: '/interview'
    },
    {
      icon: <Network className="h-10 w-10" />,
      title: t('home.memoryGraphService'),
      description: t('home.memoryGraphDescription'),
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
      link: '/memory-graph'
    },
    {
      icon: <Mic className="h-10 w-10" />,
      title: t('home.voiceCloningPlayback'),
      description: t('home.voiceCloningDescription'),
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
      link: '/voice-cloning'
    },
    {
      icon: <User className="h-10 w-10" />,
      title: t('home.avatarService'),
      description: t('home.avatarServiceDescription'),
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
      link: '/avatar-service'
    },
    {
      icon: <Image className="h-10 w-10" />,
      title: t('home.multimediaUploadLinking'),
      description: t('home.multimediaDescription'),
      gradient: 'from-indigo-500 to-violet-500',
      bgGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20',
      link: '/multimedia'
    }
  ];

  const stats = [
    { label: t('home.aiInterviews'), value: '10,000+', icon: <BrainCircuit className="h-6 w-6" />, color: 'text-blue-500' },
    { label: t('home.voiceClones'), value: '500+', icon: <Mic className="h-6 w-6" />, color: 'text-orange-500' },
    { label: t('home.memoryNodes'), value: '50,000+', icon: <Network className="h-6 w-6" />, color: 'text-purple-500' },
    { label: t('home.activeUsers'), value: '2,500+', icon: <Users className="h-6 w-6" />, color: 'text-green-500' }
  ];

  const benefits = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: t('home.realtimeAIAssistance'),
      description: t('home.realtimeAIDescription'),
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('home.privacyFirst'),
      description: t('home.privacyFirstDescription'),
      gradient: 'from-blue-400 to-indigo-500'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('home.multiPlatform'),
      description: t('home.multiPlatformDescription'),
      gradient: 'from-green-400 to-teal-500'
    }
  ];

  return (
    <div className="w-full min-h-screen overflow-hidden">
      {/* Animated Background Gradient */}
      <div 
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 50%)`
        }}
      />

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden w-full">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className={`relative z-10 text-center w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('home.badge')}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('home.title')}
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">{t('home.subtitle')}</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('home.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                document.getElementById('features-section')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              {t('home.getStarted')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Link to="/pricing">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                View Pricing
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-4 border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              onClick={() => {
                document.getElementById('features-section')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              {t('home.exploreFeatures')}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>{t('home.enterpriseReady')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>{t('home.uptime')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>{t('home.securePrivate')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-20 mb-20 w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-gray-900/50 w-full" />
        <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`flex justify-center mb-4 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section" className="py-20 mb-20 w-full">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('home.platformFeatures')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {t('home.powerfulAICapabilities')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.featuresDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              // Get color theme for each feature
              const colorMap: Record<string, { border: string; text: string; shadow: string }> = {
                'from-blue-500 to-cyan-500': {
                  border: 'hover:border-blue-300 dark:hover:border-blue-700',
                  text: 'text-blue-600 dark:text-blue-400',
                  shadow: 'hover:shadow-blue-500/20'
                },
                'from-purple-500 to-pink-500': {
                  border: 'hover:border-purple-300 dark:hover:border-purple-700',
                  text: 'text-purple-600 dark:text-purple-400',
                  shadow: 'hover:shadow-purple-500/20'
                },
                'from-orange-500 to-red-500': {
                  border: 'hover:border-orange-300 dark:hover:border-orange-700',
                  text: 'text-orange-600 dark:text-orange-400',
                  shadow: 'hover:shadow-orange-500/20'
                },
                'from-green-500 to-emerald-500': {
                  border: 'hover:border-green-300 dark:hover:border-green-700',
                  text: 'text-green-600 dark:text-green-400',
                  shadow: 'hover:shadow-green-500/20'
                },
                'from-indigo-500 to-violet-500': {
                  border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
                  text: 'text-indigo-600 dark:text-indigo-400',
                  shadow: 'hover:shadow-indigo-500/20'
                }
              };
              
              const colors = colorMap[feature.gradient] || colorMap['from-blue-500 to-cyan-500'];
              
              return (
                <Link 
                  key={index} 
                  to={feature.link}
                  className="group block h-full"
                >
                  <Card 
                    variant="hover" 
                    className={`h-full border-2 border-gray-200/50 dark:border-gray-700/50 ${colors.border} transition-all duration-500 overflow-hidden relative ${colors.shadow} hover:shadow-2xl hover:scale-[1.02]`}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <CardContent className="p-8 h-full flex flex-col relative z-10">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                        {feature.icon}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 dark:group-hover:from-white dark:group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                        {feature.description}
                      </p>
                      
                      <div className={`flex items-center ${colors.text} font-medium group-hover:translate-x-2 transition-all duration-300`}>
                        {t('home.learnMore')}
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 mb-20 w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {t('home.whyChoose')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.whyChooseDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-transparent transition-all duration-300 hover:shadow-2xl transform hover:scale-105"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${benefit.gradient} text-white mb-6 shadow-lg`}>
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 mb-20 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10 dark:opacity-20 w-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)] w-full" />
        
        <div className="relative w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('home.readyToGetStarted')}</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('home.experienceTheFuture')}
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">{t('home.ofAIPoweredLegacy')}</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            {t('home.joinThousands')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing">
              <Button 
                size="lg" 
                className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                {t('home.startFreeTrial')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button 
                size="lg" 
                className="text-lg px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {t('home.viewPricing')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
