import { useState, useEffect } from 'react';
import { Mic, ArrowLeft, CheckCircle, Sparkles, Volume2, Settings, User, History, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import VoiceRecorder from '../../components/voice-cloning/VoiceRecorder';
import VoiceCloner from '../../components/voice-cloning/VoiceCloner';
import VoiceList from '../../components/voice-cloning/VoiceList';
import TextToSpeech from '../../components/voice-cloning/TextToSpeech';
import AudioHistory from '../../components/voice-cloning/AudioHistory';
import CustomVoiceManager from '../../components/voice-cloning/CustomVoiceManager';
import { checkHealth } from '../../services/voiceCloningApi';

type ActiveTab = 'record' | 'clone' | 'speak' | 'manage' | 'custom' | 'history';

const VoiceCloningPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('record');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | undefined>();
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | undefined>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      await checkHealth();
      setBackendStatus('healthy');
    } catch (error) {
      setBackendStatus('unhealthy');
    }
  };

  const handleAudioRecorded = (blob: Blob | null) => {
    if (blob === null) {
      // Clear button was clicked - reset everything
      setAudioBlob(null);
      setActiveTab('record');
      setSelectedVoiceId(undefined);
      setSelectedVoiceName(undefined);
    } else {
      // New audio was recorded
      setAudioBlob(blob);
      setActiveTab('clone');
    }
  };

  const handleVoiceCloned = (voiceId: string, voiceName: string) => {
    setSelectedVoiceId(voiceId);
    setSelectedVoiceName(voiceName);
    setAudioBlob(null);
    setShowSuccess(true);
    setActiveTab('speak');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    setSelectedVoiceId(voiceId || undefined);
    setSelectedVoiceName(voiceName || undefined);
    setActiveTab('speak');
  };

  const handleVoicesUpdated = () => {
    // Refresh voice list if needed
  };

  const tabs = [
    {
      id: 'record' as ActiveTab,
      label: 'Record Voice',
      icon: Mic,
      description: 'Record or upload your voice sample',
      disabled: false
    },
    {
      id: 'clone' as ActiveTab,
      label: 'Clone Voice',
      icon: Sparkles,
      description: 'Create your digital voice clone',
      disabled: !audioBlob
    },
    {
      id: 'speak' as ActiveTab,
      label: 'Generate Speech',
      icon: Volume2,
      description: 'Hear text in your voice',
      disabled: !selectedVoiceId
    },
    {
      id: 'manage' as ActiveTab,
      label: 'All Voices',
      icon: User,
      description: 'View all available voices',
      disabled: false
    },
    {
      id: 'custom' as ActiveTab,
      label: 'My Voices',
      icon: Settings,
      description: 'Manage your custom voice clones',
      disabled: false
    },
    {
      id: 'history' as ActiveTab,
      label: 'History',
      icon: History,
      description: 'View your generated audio history',
      disabled: false
    }
  ];

  if (backendStatus === 'checking') {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur opacity-20 animate-pulse" />
          <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
        </div>
      </div>
    );
  }

  if (backendStatus === 'unhealthy') {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-xl">
              <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Mic className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3">
                Service Not Available
              </h2>
              <p className="text-red-700 dark:text-red-300 mb-6 text-lg">
                The voice cloning service is currently unavailable.
              </p>
              <Button 
                onClick={checkBackendHealth} 
                variant="outline"
                className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-700 hover:from-red-100 hover:to-orange-100"
              >
                Retry Connection
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-7xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link 
            to="/" 
            className="inline-flex items-center text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="text-center mb-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                AI Voice Cloning Studio
              </span>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-20 animate-pulse" />
                <div className="relative p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl">
                  <Mic className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Voice Cloning
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Studio</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Create a digital clone of your voice and generate natural speech using advanced AI technology. 
              Perfect for content creation, accessibility, and preserving your unique voice.
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm border border-green-200 dark:border-green-800 rounded-xl mb-6 max-w-2xl mx-auto shadow-lg">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-green-800 dark:text-green-200 font-semibold text-lg">
                Voice cloned successfully! Ready to generate speech in your voice.
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50 transform scale-105'
                      : isDisabled
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950/20 dark:hover:to-red-950/20 hover:scale-105'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Tab Description */}
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200/50 dark:border-red-700/30">
              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
            {activeTab === 'record' && (
              <VoiceRecorder
                onAudioRecorded={handleAudioRecorded}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
              />
            )}

            {activeTab === 'clone' && (
              <VoiceCloner
                audioBlob={audioBlob}
                onVoiceCloned={handleVoiceCloned}
              />
            )}

            {activeTab === 'speak' && (
              <div className="space-y-6">
                {!selectedVoiceId && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-sm border border-yellow-200 dark:border-yellow-800 rounded-xl p-5 shadow-lg">
                    <div className="flex items-center gap-3 text-yellow-800 dark:text-yellow-200 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-lg">No voice selected</span>
                    </div>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm ml-12">
                      Please go to "All Voices" to select a voice clone, or create one first.
                    </p>
                  </div>
                )}
                <TextToSpeech
                  selectedVoiceId={selectedVoiceId}
                  selectedVoiceName={selectedVoiceName}
                />
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="space-y-6">
                <VoiceList
                  onVoiceSelect={handleVoiceSelect}
                  selectedVoiceId={selectedVoiceId}
                  onVoicesUpdated={handleVoicesUpdated}
                />
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-6">
                <CustomVoiceManager onVoiceDeleted={handleVoicesUpdated} />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <AudioHistory />
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">How It Works</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                How Voice Cloning Works
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200/50 dark:border-orange-700/30 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur opacity-20" />
                  <div className="relative w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">1. Record Your Voice</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Record at least 30 seconds of clear speech or upload an audio file. 
                  Our AI analyzes your unique vocal characteristics.
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200/50 dark:border-pink-700/30 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-20" />
                  <div className="relative w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">2. AI Processing</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Advanced neural networks create a digital fingerprint of your voice, 
                  capturing tone, pitch, and speaking patterns.
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200/50 dark:border-cyan-700/30 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-20" />
                  <div className="relative w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Volume2 className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">3. Generate Speech</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Type any text and hear it spoken in your own voice with natural 
                  intonation and emotion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCloningPage;
