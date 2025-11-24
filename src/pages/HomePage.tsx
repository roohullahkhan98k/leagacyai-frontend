import { ArrowRight, BrainCircuit, Network, Mic, User, Image, Users, Zap, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import PageContainer from '../components/layout/PageContainer';

const HomePage = () => {
  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8" />,
      title: 'AI Interview Engine',
      description: 'Real-time transcription with GPT-4 powered Q&A generation. Get instant answer suggestions during interviews with voice capture and screen sharing.',
      status: 'Ready',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      link: '/interview'
    },
    {
      icon: <Network className="h-8 w-8" />,
      title: 'Memory Graph Service',
      description: 'GraphQL/REST API for semantic memory relationships. Visualize connections between people, memories, events, and media with D3.js.',
      status: 'Ready',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      link: '/memory-graph'
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: 'Voice Cloning & Playback',
      description: 'Clone voices with ElevenLabs API. Upload samples and play back memories with familiar voices. Perfect for preserving family stories.',
      status: 'Ready',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      link: '/voice-cloning'
    },
    {
      icon: <User className="h-8 w-8" />,
      title: 'Avatar Service',
      description: 'Generate 3D avatars from photos using Ready Player Me. Automated rigging and lip sync for animated conversations.',
      status: 'Ready',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      link: '/avatar-service'
    },
    {
      icon: <Image className="h-8 w-8" />,
      title: 'Multimedia Upload & Linking',
      description: 'Drag-and-drop media upload with auto-tagging. Link photos and videos to memory nodes with metadata enrichment.',
      status: 'Ready',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      link: '/multimedia'
    }
  ];

  const stats = [
    { label: 'AI Interviews', value: '10,000+', icon: <BrainCircuit className="h-5 w-5" /> },
    { label: 'Voice Clones', value: '500+', icon: <Mic className="h-5 w-5" /> },
    { label: 'Memory Nodes', value: '50,000+', icon: <Network className="h-5 w-5" /> },
    { label: 'Active Users', value: '2,500+', icon: <Users className="h-5 w-5" /> }
  ];

  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Real-time AI Assistance',
      description: 'Get instant help during interviews with live transcription and smart suggestions.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Privacy First',
      description: 'Your data stays secure with enterprise-grade encryption and local processing options.'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Multi-platform',
      description: 'Works seamlessly across web browsers, mobile devices, and desktop applications.'
    }
  ];

  return (
    <PageContainer>
      {/* Hero section */}
      <div className="text-center py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Legacy AI Prototype
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A comprehensive AI platform featuring cutting-edge technologies for interviews, memory management, voice cloning, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              onClick={() => {
                document.getElementById('features-section')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              Explore Features
            </Button>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="py-12 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/10 dark:to-accent-900/10 rounded-2xl mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto px-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-2 text-primary-600 dark:text-primary-400">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features section */}
      <div id="features-section" className="py-12 md:py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Platform Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore our comprehensive suite of AI-powered tools designed to enhance your digital experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} variant="hover" className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600">
                    {feature.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${feature.statusColor}`}>
                    {feature.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                  {feature.description}
                </p>
                

                
                <Link to={feature.link} className="mt-auto">
                  <Button 
                    variant="ghost" 
                    className="w-full text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  >
                    {feature.status === 'Ready' ? 'Try Now' : feature.status === 'Learn One Let\'s Go' ? 'Learn One Let\'s Go' : 'Learn More'} 
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits section */}
      <div className="py-12 md:py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Legacy AI?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Built with cutting-edge technology and user experience in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Explore our comprehensive suite of AI-powered features and discover what's possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Contact Us
            </Button>
          </div>
        </div>
      </div>

    </PageContainer>
  );
};

export default HomePage;