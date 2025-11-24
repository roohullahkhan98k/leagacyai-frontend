import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import Button from '../ui/Button';

interface LiveTranscriptProps {
  isActive: boolean;
  onTranscriptUpdate?: (transcript: string) => void;
}

const LiveTranscript = ({ 
  isActive,
  onTranscriptUpdate 
}: LiveTranscriptProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  useEffect(() => {
    if (!isActive) {
      setIsListening(false);
      setTranscript('');
      return;
    }
  }, [isActive]);
  
  useEffect(() => {
    if (onTranscriptUpdate && transcript) {
      onTranscriptUpdate(transcript);
    }
  }, [transcript, onTranscriptUpdate]);
  
  const toggleListening = () => {
    setIsListening(!isListening);
  };
  
  if (!isActive) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 max-w-md w-[calc(100vw-2rem)] bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-floating border border-gray-200 dark:border-gray-700"
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-medium">Live Transcript</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleListening}
          className={`h-8 w-8 p-0 ${isListening ? 'text-success-500' : 'text-gray-500'}`}
        >
          {isListening ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 min-h-[2.5rem]">
          {transcript || (isListening ? 'Listening...' : 'Click the microphone to start')}
        </p>
      </div>
    </motion.div>
  );
};

export default LiveTranscript;