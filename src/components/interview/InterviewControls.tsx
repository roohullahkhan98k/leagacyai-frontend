import { useState, useEffect, useCallback } from 'react';
import { Clock, Settings, Mic, MicOff } from 'lucide-react';
import Button from '../ui/Button';

interface InterviewControlsProps {
  onStart: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
  isActive: boolean;
}

const InterviewControls = ({
  onStart,
  onStop,
  onOpenSettings,
  isActive,
}: InterviewControlsProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fetch available audio devices and validate selected device
  const loadAudioDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);
      
      // If no devices are available, set appropriate error
      if (audioInputs.length === 0) {
        setMicrophoneError('No microphone devices found. Please connect a microphone.');
        return;
      }

      // Always ensure a device is selected if available
      if (audioInputs.length > 0) {
        // If no device is currently selected or the selected device is no longer available,
        // select the first available device
        const deviceExists = selectedDeviceId && audioInputs.some(device => device.deviceId === selectedDeviceId);
        if (!deviceExists) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
      setMicrophoneError('Failed to access audio devices. Please check your browser permissions.');
    }
  }, [selectedDeviceId]);

  // Listen for device changes
  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', loadAudioDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadAudioDevices);
    };
  }, [loadAudioDevices]);
  
  // Initialize microphone stream when interview becomes active
  useEffect(() => {
    const setupMicrophone = async () => {
      if (isActive) {
        await loadAudioDevices();
        // Only initialize microphone if we have a selected device and no error
        if (selectedDeviceId && !microphoneError) {
          await initializeMicrophone();
        }
      } else {
        // Clean up microphone stream when interview ends
        microphoneStream?.getTracks().forEach(track => track.stop());
        setMicrophoneStream(null);
        setMicrophoneError(null);
      }
    };

    setupMicrophone();
    
    return () => {
      if (!isActive) {
        microphoneStream?.getTracks().forEach(track => track.stop());
        setMicrophoneStream(null);
        setMicrophoneError(null);
      }
    };
  }, [isActive, selectedDeviceId]);
  
  // Handle timer
  useEffect(() => {
    let timerId: number | undefined;
    
    if (isActive) {
      timerId = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isActive]);

  const initializeMicrophone = useCallback(async () => {
    try {
      // Validate device selection before attempting to access
      if (!selectedDeviceId) {
        throw new Error('No microphone device selected');
      }

      const deviceExists = audioDevices.some(device => device.deviceId === selectedDeviceId);
      if (!deviceExists) {
        throw new Error('Selected microphone device is no longer available');
      }

      // Clear any previous error state
      setMicrophoneError(null);

      // Configure audio constraints with selected device
      const constraints = {
        audio: {
          deviceId: { exact: selectedDeviceId },
          echoCancellation: true,
          noiseSuppression: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMicrophoneStream(stream);
      setMicrophoneError(null);
      setIsMuted(false);
    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      
      let errorMessage = 'Unable to access microphone. Please check your permissions and device settings.';
      
      if (error.name === 'NotFoundError' || error.message.includes('no longer available')) {
        if (audioDevices.length === 0) {
          errorMessage = 'No microphone found. Please connect a microphone device.';
        } else {
          errorMessage = 'Selected microphone not found. Please select a different device.';
        }
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Unable to access microphone. The device might be in use by another application.';
      }
      
      setMicrophoneError(errorMessage);
      setMicrophoneStream(null);
      setIsMuted(true);
    }
  }, [selectedDeviceId, audioDevices]);

  const toggleMicrophone = useCallback(() => {
    if (!microphoneStream && !microphoneError) {
      // If no stream exists and no previous error, try to initialize
      initializeMicrophone();
      return;
    }

    if (microphoneStream) {
      const newMutedState = !isMuted;
      microphoneStream.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
      setIsMuted(newMutedState);
    }
  }, [microphoneStream, microphoneError, isMuted]);

  // Handle device selection change
  const handleDeviceChange = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (microphoneStream) {
      // Stop current stream before initializing new one
      microphoneStream.getTracks().forEach(track => track.stop());
      setMicrophoneStream(null);
    }
    initializeMicrophone();
  }, [microphoneStream]);
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] bg-gray-900/90 backdrop-blur-md rounded-full shadow-lg">
      <div className="flex items-center p-2 space-x-2">
        {isActive && (
          <>
            <div className="flex items-center px-3 text-white">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">{formatTime(elapsedTime)}</span>
            </div>
            
            {audioDevices.length > 0 && (
              <select
                className="bg-gray-800 text-white text-sm rounded-lg px-2 py-1 mr-2"
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
              >
                {audioDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 4)}`}
                  </option>
                ))}
              </select>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMicrophone}
              disabled={!!microphoneError}
              className="h-10 w-10 p-0 rounded-full text-white hover:bg-gray-800 relative group"
            >
              {isMuted ? (
                <MicOff className="h-5 w-5 text-error-500" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
              {microphoneError && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {microphoneError}
                </span>
              )}
            </Button>
          </>
        )}
        
        <Button
          variant={isActive ? "outline" : "primary"}
          size="sm"
          onClick={isActive ? onStop : onStart}
          className={`px-4 rounded-full ${isActive ? 'border-error-500 text-error-500 hover:bg-error-500/10' : ''}`}
        >
          {isActive ? 'End' : 'Start Interview'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="h-10 w-10 p-0 rounded-full text-white"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default InterviewControls;