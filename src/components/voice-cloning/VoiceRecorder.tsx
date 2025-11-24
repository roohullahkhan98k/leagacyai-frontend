import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';

interface VoiceRecorderProps {
  onAudioRecorded: (audioBlob: Blob | null) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const VoiceRecorder = ({ onAudioRecorded, isRecording, setIsRecording }: VoiceRecorderProps) => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingQuality, setRecordingQuality] = useState<'good' | 'warning' | 'poor' | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Create audio context for level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        onAudioRecorded(blob);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setRecordingQuality(null);

      // Monitor audio levels
      const monitorAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(average);
        
        // Determine recording quality
        if (average > 50) {
          setRecordingQuality('good');
        } else if (average > 20) {
          setRecordingQuality('warning');
        } else {
          setRecordingQuality('poor');
        }
        
        if (isRecording) {
          animationRef.current = requestAnimationFrame(monitorAudio);
        }
      };
      
      monitorAudio();
      
    } catch (err) {
      setError('Failed to start recording: ' + (err as Error).message);
      setRecordingQuality(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      setRecordingQuality(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const blob = new Blob([file], { type: file.type });
      setAudioBlob(blob);
      onAudioRecorded(blob);
      setError(null);
      setRecordingQuality('good');
    } else {
      setError('Please select a valid audio file');
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);
    setRecordingQuality(null);
    setIsPlayingPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Notify parent to reset the workflow
    onAudioRecorded(null);
  };

  const togglePreview = () => {
    if (audioRef.current) {
      if (isPlayingPreview) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingPreview(!isPlayingPreview);
    }
  };

  const getQualityColor = (quality: string | null) => {
    switch (quality) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getQualityIcon = (quality: string | null) => {
    switch (quality) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'poor': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Mic className="h-5 w-5 text-purple-600" />
          </div>
          Record Your Voice Sample
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recording Controls */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? 'secondary' : 'primary'}
              size="lg"
              className="flex-1"
              disabled={!!audioBlob}
            >
              {isRecording ? (
                <>
                  <Square className="h-5 w-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="lg"
              disabled={isRecording}
              className="px-6"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload File
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-red-800 dark:text-red-200">Recording...</span>
              </div>
              <div className="font-mono text-red-700 dark:text-red-300">
                {formatDuration(recordingDuration)}
              </div>
            </div>
            
            {/* Audio Level Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-700 dark:text-red-300">Audio Level</span>
                <span className={`font-medium ${getQualityColor(recordingQuality)}`}>
                  {recordingQuality && (
                    <div className="flex items-center gap-1">
                      {getQualityIcon(recordingQuality)}
                      {recordingQuality === 'good' ? 'Good' : 
                       recordingQuality === 'warning' ? 'Low' : 'Very Low'}
                    </div>
                  )}
                </span>
              </div>
              <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Preview */}
        {audioBlob && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Voice Sample Ready
                </span>
              </div>
              <Button
                onClick={clearRecording}
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800/30"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear & Record Again
              </Button>
            </div>
            
            <div className="space-y-3">
              <audio 
                ref={audioRef}
                controls 
                src={URL.createObjectURL(audioBlob)}
                className="w-full"
                onPlay={() => setIsPlayingPreview(true)}
                onPause={() => setIsPlayingPreview(false)}
                onEnded={() => setIsPlayingPreview(false)}
              />
              
              <div className="flex items-center justify-between text-sm text-green-700 dark:text-green-300">
                <span>Duration: {formatDuration(recordingDuration)}</span>
                <span>Ready for voice cloning</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Recording Error</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Recording Tips</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Record at least 30 seconds of clear, natural speech</li>
            <li>• Speak in your normal voice and pace</li>
            <li>• Choose a quiet environment with minimal background noise</li>
            <li>• Keep the microphone at a consistent distance</li>
            <li>• Supported formats: WAV, MP3, M4A, WebM</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
