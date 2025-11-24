import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
import Button from './Button';
import LipSyncAvatarViewer from './LipSyncAvatarViewer';

interface LipSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  lipsyncUrl: string;
  audioUrl?: string;
  onTimeUpdate?: (time: number) => void;
}

interface LipSyncData {
  duration?: number;
  keyframes?: Array<{
    time: number;
    visemes: Record<string, number>;
  }>;
  mouthCues?: Array<{
    start: number;
    end: number;
    value: string;
  }>;
}

const LipSyncModal = ({ isOpen, onClose, modelUrl, lipsyncUrl, audioUrl, onTimeUpdate }: LipSyncModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [lipSyncData, setLipSyncData] = useState<LipSyncData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentViseme, setCurrentViseme] = useState<string>('X');
  const [audioLoaded, setAudioLoaded] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Load lip sync data
  useEffect(() => {
    if (!isOpen || !lipsyncUrl) return;

    const loadLipSyncData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading lip sync data from:', lipsyncUrl);
        const response = await fetch(lipsyncUrl);
        if (!response.ok) throw new Error('Failed to load lip sync data');
        const data = await response.json();
        console.log('Loaded lip sync data:', data);
        console.log('Lipsync data keys:', Object.keys(data));
        if (data.metadata) {
          console.log('Lipsync metadata:', data.metadata);
        }
        setLipSyncData(data);
        
        // Use duration from data or calculate from last mouthCue
        let calculatedDuration = data.duration;
        if (!calculatedDuration && data.mouthCues && data.mouthCues.length > 0) {
          calculatedDuration = data.mouthCues[data.mouthCues.length - 1].end;
          console.log('Calculated duration from mouthCues:', calculatedDuration);
        } else if (!calculatedDuration && data.keyframes && data.keyframes.length > 0) {
          calculatedDuration = data.keyframes[data.keyframes.length - 1].time;
          console.log('Calculated duration from keyframes:', calculatedDuration);
        } else if (!calculatedDuration) {
          calculatedDuration = 10; // fallback
          console.log('Using fallback duration:', calculatedDuration);
        }
        setDuration(calculatedDuration);
        console.log('Final duration set to:', calculatedDuration);
        
        // Log some sample mouth cues for debugging
        if (data.mouthCues && data.mouthCues.length > 0) {
          console.log('Sample mouth cues:', data.mouthCues.slice(0, 5));
          console.log('Total mouth cues:', data.mouthCues.length);
        }
      } catch (err: any) {
        console.error('Failed to load lip sync data:', err);
        setError(err?.message || 'Failed to load lip sync data');
      } finally {
        setLoading(false);
      }
    };

    loadLipSyncData();
  }, [isOpen, lipsyncUrl]);


  // Audio setup
  useEffect(() => {
    if (!isOpen) return;
    
    console.log('🎵 Audio setup - audioUrl:', audioUrl);
    if (!audioUrl) {
      console.log('🎵 No audio URL available');
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    console.log('🎵 Audio element created:', audio);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      console.log('🎵 Audio loaded - duration:', audioDuration);
      // Use audio duration if it's longer than lip sync duration
      if (audioDuration > duration) {
        setDuration(audioDuration);
        console.log('🎵 Updated duration to audio duration:', audioDuration);
      }
    };

    const handleCanPlay = () => {
      console.log('🎵 Audio can play - ready to play');
      setAudioLoaded(true);
    };

    const handleError = (e: any) => {
      console.error('🎵 Audio error:', e);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isOpen, audioUrl]);


  // Animation loop for lip sync
  useEffect(() => {
    if (!isPlaying || !lipSyncData) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = () => {
      if (!startTimeRef.current) {
        startTimeRef.current = performance.now() - currentTime * 1000;
      }

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      
      if (elapsed >= duration) {
        setIsPlaying(false);
        setCurrentTime(0);
        startTimeRef.current = null;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        return;
      }

      setCurrentTime(elapsed);
      onTimeUpdate?.(elapsed);

      // Update current viseme for display
      if (lipSyncData?.mouthCues) {
        const currentCue = lipSyncData.mouthCues.find(cue => elapsed >= cue.start && elapsed <= cue.end);
        if (currentCue) {
          setCurrentViseme(currentCue.value);
        } else {
          setCurrentViseme('X'); // neutral
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, lipSyncData, duration, onTimeUpdate]);

  const handlePlay = () => {
    console.log('🎵 Play button clicked');
    console.log('🎵 Audio ref:', audioRef.current);
    console.log('🎵 Current audio URL:', audioUrl);
    if (audioRef.current) {
      console.log('🎵 Attempting to play audio...');
      audioRef.current.play()
        .then(() => {
          console.log('🎵 Audio started playing successfully');
        })
        .catch((error) => {
          console.error('🎵 Audio play failed:', error);
        });
    } else {
      console.log('🎵 No audio ref available');
    }
    setIsPlaying(true);
    startTimeRef.current = performance.now() - currentTime * 1000;
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    startTimeRef.current = null;
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    startTimeRef.current = performance.now() - newTime * 1000;
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Lip Sync Animation</h2>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading lip sync data...</div>
            </div>
          )}

          {error && (
            <div className="p-3 border border-red-300 text-red-700 rounded bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
              {error}
            </div>
          )}


          {/* Audio Status */}
          {audioUrl && (
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${audioLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium">
                  {audioLoaded ? 'Audio Ready' : 'Loading Audio...'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {audioLoaded ? 'Click Play to start audio and lip sync' : 'Please wait while audio loads...'}
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* 3D Model Viewer with Lip Sync */}
              <LipSyncAvatarViewer
                modelUrl={modelUrl}
                lipsyncUrl={lipsyncUrl}
                isPlaying={isPlaying}
                currentTime={currentTime}
                className="h-96 w-full"
              />
              {lipSyncData && (
                <div className="text-xs text-gray-400 mt-2 text-center">
                  Duration: {formatTime(duration)} | Mouth Cues: {lipSyncData.mouthCues?.length || lipSyncData.keyframes?.length || 0}
                  <br />
                  Current Time: {formatTime(currentTime)} | Playing: {isPlaying ? 'Yes' : 'No'}
                  <br />
                  Current Viseme: <span className="font-bold text-primary-600">{currentViseme}</span>
                </div>
              )}

              {/* Controls */}
              <div className="space-y-4">
                {/* Playback Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  
                  <Button onClick={handleStop} variant="outline" className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>

                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      onClick={handleMute}
                      variant="ghost"
                      className="p-2"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>

              {/* Debug Info */}
              <div className="text-xs text-gray-400 space-y-1">
                <div><strong>Model URL:</strong> {modelUrl}</div>
                <div><strong>Lip Sync URL:</strong> {lipsyncUrl}</div>
                {audioUrl && <div><strong>Audio URL:</strong> {audioUrl}</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LipSyncModal;
