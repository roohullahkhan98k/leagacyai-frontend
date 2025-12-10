import { useState, useEffect } from 'react';
import { Sparkles, User, Clock, CheckCircle, AlertCircle, Info, Brain, RotateCcw, Globe } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cloneVoice, CloneVoiceRequest } from '../../services/voiceCloningApi';
import { ACCENTS, DEFAULT_ACCENT } from '../../constants/accents';
import { toast } from 'react-toastify';

interface VoiceClonerProps {
  audioBlob: Blob | null;
  onVoiceCloned: (voiceId: string, voiceName: string) => void;
}

const VoiceCloner = ({ audioBlob, onVoiceCloned }: VoiceClonerProps) => {
  const [voiceName, setVoiceName] = useState('');
  const [description, setDescription] = useState('');
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT); // REQUIRED: Accent selection
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [cloningStep, setCloningStep] = useState<string>('');

  // Only set default name once when audio is first available
  useEffect(() => {
    if (!voiceName && audioBlob) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      setVoiceName(`My Voice - ${timeStr}`);
    }
  }, [audioBlob]); // Removed voiceName dependency to prevent re-triggering

  // Reset form when audio is cleared
  useEffect(() => {
    if (!audioBlob) {
      setVoiceName('');
      setDescription('');
      setError(null);
      setProgress(0);
      setCloningStep('');
    }
  }, [audioBlob]);

  const handleCloneVoice = async () => {
    if (!audioBlob || !voiceName.trim()) {
      setError('Please provide an audio sample and voice name');
      return;
    }

    setIsCloning(true);
    setError(null);
    setProgress(0);
    setCloningStep('Preparing audio sample...');

    try {
      // Simulate progress steps
      const steps = [
        { step: 'Preparing audio sample...', progress: 10 },
        { step: 'Analyzing voice characteristics...', progress: 25 },
        { step: 'Training AI model...', progress: 50 },
        { step: 'Optimizing voice clone...', progress: 75 },
        { step: 'Finalizing voice clone...', progress: 90 }
      ];

      // Convert Blob to File for the API
      const audioFile = new File([audioBlob], 'voice_sample.wav', { type: audioBlob.type });
      
      const payload: CloneVoiceRequest = {
        audio: audioFile,
        voiceName: voiceName.trim(),
        description: description.trim() || undefined,
        accent: accent // REQUIRED - Must include accent
      };

      // Start progress simulation
      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < steps.length) {
          setCloningStep(steps[currentStep].step);
          setProgress(steps[currentStep].progress);
          currentStep++;
        }
      }, 1000);

      const result = await cloneVoice(payload);

      clearInterval(progressInterval);
      setProgress(100);
      setCloningStep('Voice clone created successfully!');

      if (result.success) {
        toast.success(`Voice "${result.name}" cloned successfully!`, {
          position: 'top-right',
          autoClose: 3000,
        });
        
        setTimeout(() => {
          onVoiceCloned(result.voiceId, result.name);
          setVoiceName('');
          setDescription('');
          setError(null);
          setProgress(0);
          setCloningStep('');
        }, 1000);
      } else {
        setError('Voice cloning failed. Please try again.');
        toast.error('Voice cloning failed', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to clone your voice: ' + (err as Error).message;
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      setProgress(0);
      setCloningStep('');
    } finally {
      setIsCloning(false);
    }
  };

  const isFormValid = audioBlob && voiceName.trim().length > 0;
  const isNameValid = voiceName.trim().length >= 2;
  const isNameTooLong = voiceName.length > 50;

  const getValidationMessage = () => {
    if (!voiceName.trim()) return null;
    if (isNameTooLong) return 'Name is too long (max 50 characters)';
    if (!isNameValid) return 'Name must be at least 2 characters';
    return 'Name looks good!';
  };

  const validationMessage = getValidationMessage();
  const isValidMessage = validationMessage === 'Name looks good!';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
            <Sparkles className="h-5 w-5 text-pink-600" />
          </div>
          Create Voice Clone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Status */}
        <div className={`flex items-center justify-between p-4 rounded-lg ${
          audioBlob 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center gap-2">
            {audioBlob ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <span className={`text-sm font-medium ${
              audioBlob 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              {audioBlob 
                ? 'Voice sample ready for cloning' 
                : 'Please record or upload your voice sample first'
              }
            </span>
          </div>
          
          {audioBlob && (
            <Button
              onClick={() => {
                setVoiceName('');
                setDescription('');
                setError(null);
                setProgress(0);
                setCloningStep('');
              }}
              variant="ghost"
              size="sm"
              className="text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800/30"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice Clone Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="Enter a name for your voice clone"
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-colors ${
                  isNameTooLong 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                    : isValidMessage
                    ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                }`}
                disabled={isCloning}
                maxLength={50}
              />
              <div className="absolute right-3 top-3">
                {isValidMessage ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : isNameTooLong ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : null}
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className={`text-xs ${
                isNameTooLong 
                  ? 'text-red-600 dark:text-red-400' 
                  : isValidMessage
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {validationMessage}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {voiceName.length}/50
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when you might use this voice clone..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-colors"
              disabled={isCloning}
              maxLength={200}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {description.length}/200
              </span>
            </div>
          </div>

          {/* REQUIRED: Accent Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              Accent/Language *
            </label>
            <select
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              disabled={isCloning}
            >
              {ACCENTS.map(acc => (
                <option key={acc.code} value={acc.code}>
                  {acc.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select the accent/language for this voice clone
            </p>
          </div>
        </div>

        {/* Cloning Progress */}
        {isCloning && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Creating your voice clone...
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">{cloningStep}</span>
                <span className="text-blue-700 dark:text-blue-300">{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleCloneVoice}
          disabled={!isFormValid || isCloning || isNameTooLong}
          isLoading={isCloning}
          className="w-full"
          size="lg"
        >
          {isCloning ? 'Creating Voice Clone...' : 'Create Voice Clone'}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Cloning Failed</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Information Panel */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2 mb-3">
            <Info className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
            <h4 className="font-medium text-gray-800 dark:text-gray-200">What happens next?</h4>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
              <span>Voice cloning typically takes 1-2 minutes to complete</span>
            </li>
            <li className="flex items-start gap-2">
              <Brain className="h-4 w-4 mt-0.5 text-gray-500" />
              <span>AI analyzes your voice patterns, tone, and speaking style</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-gray-500" />
              <span>Higher quality audio samples produce better voice clones</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-gray-500" />
              <span>You can create multiple voice clones for different purposes</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCloner;
