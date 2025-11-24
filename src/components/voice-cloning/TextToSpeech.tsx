import { useState, useRef, useEffect } from 'react';
import { Volume2, Download, Play, Pause, User, Settings, Wand2, Clock, FileText, Sliders } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { generateSpeech } from '../../services/voiceCloningApi';
import { toast } from 'react-toastify';

interface TextToSpeechProps {
  selectedVoiceId?: string;
  selectedVoiceName?: string;
}

const TextToSpeech = ({ selectedVoiceId, selectedVoiceName }: TextToSpeechProps) => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarityBoost: 0.75
  });
  const [modelId, setModelId] = useState('eleven_multilingual_v2');
  const [outputFormat, setOutputFormat] = useState('mp3_44100_128');
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const models = [
    { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Best for most languages' },
    { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'Fastest generation' },
    { id: 'eleven_flash_v2', name: 'Flash v2', description: 'Balanced speed/quality' }
  ];

  const formats = [
    { id: 'mp3_44100_128', name: 'MP3 (44.1kHz)', description: 'High quality, recommended' },
    { id: 'mp3_22050_64', name: 'MP3 (22kHz)', description: 'Smaller file size' },
    { id: 'pcm_16000', name: 'PCM (16kHz)', description: 'Raw format for processing' }
  ];

  const generateSpeechAudio = async () => {
    if (!selectedVoiceId || !text.trim()) {
      setError('Please select your voice clone and enter text');
      return;
    }

    const startTime = Date.now();
    setIsGenerating(true);
    setError(null);
    setGeneratedAudio(null);

    try {
      const payload = {
        text: text.trim(),
        voiceId: selectedVoiceId,
        voiceName: selectedVoiceName,
        modelId: modelId,
        outputFormat: outputFormat,
        voiceSettings: voiceSettings
      };

      const result = await generateSpeech(payload);
      const endTime = Date.now();
      setGenerationTime(endTime - startTime);

      if (result.success) {
        const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
        const base = rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';
        const fullAudioUrl = result.audioUrl.startsWith('http')
          ? result.audioUrl
          : base
          ? `${base}${result.audioUrl}`
          : result.audioUrl;
        setGeneratedAudio(fullAudioUrl);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = fullAudioUrl;
          audioRef.current.load();
          audioRef.current.play().catch(() => undefined);
        }
        toast.success('Speech generated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        const errorMessage = 'Speech generation failed. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to generate speech: ' + (err as Error).message;
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const downloadAudio = () => {
    if (generatedAudio) {
      const link = document.createElement('a');
      link.href = generatedAudio;
      link.download = `generated_speech_${selectedVoiceName?.replace(/\s+/g, '_') || 'voice'}_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearText = () => {
    setText('');
    setGeneratedAudio(null);
    setError(null);
    setGenerationTime(null);
  };

  useEffect(() => {
    if (!generatedAudio || !audioRef.current) return;

    const audioElement = audioRef.current;
    const playAfterLoad = () => {
      audioElement.play().catch(() => undefined);
    };

    audioElement.pause();
    audioElement.src = generatedAudio;
    audioElement.load();
    audioElement.addEventListener('loadedmetadata', playAfterLoad, { once: true });

    return () => {
      audioElement.removeEventListener('loadedmetadata', playAfterLoad);
    };
  }, [generatedAudio]);

  const insertSampleText = (sample: string) => {
    setText(sample);
  };

  const sampleTexts = [
    "Hello! This is my cloned voice speaking. It sounds just like me!",
    "Welcome to our presentation. Today we'll be discussing the latest innovations in AI technology.",
    "Thank you for calling. How can I help you today?",
    "I hope you're having a wonderful day. The weather is beautiful today, isn't it?"
  ];

  const isFormValid = selectedVoiceId && text.trim().length > 0;
  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const estimatedDuration = Math.max(1, Math.ceil(wordCount / 2.5)); // Rough estimate: 150 words per minute

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Volume2 className="h-5 w-5 text-green-600" />
          </div>
          Generate Speech
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Status */}
        {selectedVoiceName ? (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <User className="h-5 w-5 text-green-600" />
            <div>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Using voice: <strong>{selectedVoiceName}</strong>
              </span>
              <p className="text-xs text-green-700 dark:text-green-300">
                Ready to generate speech in your own voice
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <User className="h-5 w-5 text-yellow-600" />
            <div>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                No voice selected
              </span>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Please go to "Manage Voices" to select a voice clone first
              </p>
            </div>
          </div>
        )}

        {/* Text Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Text to Speak *
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => insertSampleText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])}
                variant="ghost"
                size="sm"
                className="text-xs"
                disabled={isGenerating}
              >
                <FileText className="h-3 w-3 mr-1" />
                Sample
              </Button>
              <Button
                onClick={clearText}
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                disabled={isGenerating || !text}
              >
                Clear
              </Button>
            </div>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to hear spoken in your own voice..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-colors"
            disabled={isGenerating || !selectedVoiceId}
            maxLength={5000}
          />
          
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex gap-4">
              <span>{characterCount} characters</span>
              <span>{wordCount} words</span>
              <span>~{estimatedDuration}s duration</span>
            </div>
            <span>{characterCount}/5000</span>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Settings</h4>
            <Button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>

          {showAdvancedSettings && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isGenerating}
                >
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isGenerating}
                >
                  {formats.map(format => (
                    <option key={format.id} value={format.id}>
                      {format.name} - {format.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Settings */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stability: {voiceSettings.stability}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.stability}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                    className="w-full"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Higher values make the voice more consistent, lower values add more variation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Similarity Boost: {voiceSettings.similarityBoost}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.similarityBoost}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, similarityBoost: parseFloat(e.target.value) }))}
                    className="w-full"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Higher values make the voice sound more like your original sample
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateSpeechAudio}
          disabled={!isFormValid || isGenerating}
          isLoading={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Wand2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Speech...
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5 mr-2" />
              Generate Speech
            </>
          )}
        </Button>

        {/* Generated Audio */}
        {generatedAudio && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  Generated Speech
                </h4>
              </div>
              {generationTime && (
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <Clock className="h-3 w-3" />
                  {generationTime}ms
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <audio
                ref={audioRef}
                src={generatedAudio}
                onEnded={handleAudioEnded}
                onPlay={handleAudioPlay}
                onPause={handleAudioPause}
                className="w-full"
                controls
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handlePlayPause}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={downloadAudio}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <span className="font-medium">Generation Failed</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Tips for Better Results</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use natural punctuation and pauses for more realistic speech</li>
            <li>• Longer text takes more time to generate but often sounds more natural</li>
            <li>• Adjust stability and similarity boost for different speaking styles</li>
            <li>• Try different models for various use cases (speed vs quality)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextToSpeech;
