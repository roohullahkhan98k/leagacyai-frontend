import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

interface ScreenShareProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  onStreamReady?: (stream: MediaStream) => void;
}

const ScreenShare = ({
  isActive,
  onStart,
  onStop,
  stream,
  error,
  isLoading,
  onStreamReady,
}: ScreenShareProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);

  useEffect(() => {
    // Check browser support for screen sharing and WebRTC
    if (!navigator.mediaDevices?.getDisplayMedia || !window.RTCPeerConnection) {
      setIsBrowserSupported(false);
    }
  }, []);

  useEffect(() => {
    if (isActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      if (onStreamReady) {
        onStreamReady(stream);
      }
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [isActive, stream, onStreamReady]);

  if (!isBrowserSupported) {
    return (
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Browser Not Supported</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Screen sharing or WebRTC is not supported in your browser. Please use Chrome, Firefox, or Edge for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden group h-full">
      {!isActive ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            {error ? (
              <div className="mb-4 p-4 bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-300 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5" />
                  <div className="text-sm whitespace-pre-line">{error}</div>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-medium mb-2">Start Screen Sharing</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Share your screen to start the interview session. You can share your entire screen or a specific window.
                </p>
              </>
            )}
            <Button
              onClick={onStart}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Starting Screen Share...' : 'Start Screen Share'}
            </Button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain bg-black"
        />
      )}
    </div>
  );
};

export default ScreenShare;
