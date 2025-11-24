import { useState, useEffect } from 'react';
import { Mic, ArrowLeft, CheckCircle, Sparkles, Volume2, Settings, User, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/layout/PageContainer';
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
      <PageContainer>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (backendStatus === 'unhealthy') {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                Service Not Available
              </h2>
              <p className="text-red-700 dark:text-red-300 mb-4">
                The voice cloning service is currently unavailable.
              </p>
              <Button onClick={checkBackendHealth} variant="outline">
                Retry Connection
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
                <Mic className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Voice Cloning Studio
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Create a digital clone of your voice and generate natural speech using advanced AI technology. 
              Perfect for content creation, accessibility, and preserving your unique voice.
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6 max-w-2xl mx-auto">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Voice cloned successfully! Ready to generate speech in your voice.
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg'
                      : isDisabled
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Tab Description */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
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
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <User className="h-5 w-5" />
                    <span className="font-medium">No voice selected</span>
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                    Please go to "Manage Voices" to select a voice clone, or create one first.
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

        {/* Footer Info */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
            <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              How Voice Cloning Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2">1. Record Your Voice</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Record at least 30 seconds of clear speech or upload an audio file. 
                  Our AI analyzes your unique vocal characteristics.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2">2. AI Processing</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Advanced neural networks create a digital fingerprint of your voice, 
                  capturing tone, pitch, and speaking patterns.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2">3. Generate Speech</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Type any text and hear it spoken in your own voice with natural 
                  intonation and emotion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default VoiceCloningPage;
