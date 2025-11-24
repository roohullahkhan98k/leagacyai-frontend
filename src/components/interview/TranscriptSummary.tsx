import { BrainCircuit, MessageSquare, Target, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TranscriptSummaryProps {
  transcript: string;
  isActive: boolean;
  onGetAnswer?: () => void;
}

interface AIResponse {
  transcript: string;
  answer: string;
  isStreaming: boolean;
}

const TranscriptSummary = ({ }: TranscriptSummaryProps) => {
  const [currentAnswer, setCurrentAnswer] = useState<AIResponse | null>(null);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Listen for AI responses from WebSocket
  useEffect(() => {
    const handleAIResponseChunk = (event: CustomEvent) => {
      const { chunk, isComplete } = event.detail;
      
      if (isComplete) {
        // Finalize the response
        setCurrentAnswer({
          transcript: '', // Will be set from start event
          answer: streamingAnswer + chunk,
          isStreaming: false
        });
        setIsStreaming(false);
        setStreamingAnswer('');
      } else {
        // Update streaming response
        setStreamingAnswer(prev => prev + chunk);
        setIsStreaming(true);
      }
    };

    const handleAIResponseStart = (event: CustomEvent) => {
      const { transcript } = event.detail;
      
      setCurrentAnswer(null);
      setStreamingAnswer('');
      setIsStreaming(true);
    };

    const handleAIResponseComplete = (event: CustomEvent) => {
      const { fullResponse } = event.detail;
      
      setCurrentAnswer({
        transcript: '', // Will be set from start event
        answer: fullResponse,
        isStreaming: false
      });
      setIsStreaming(false);
      setStreamingAnswer('');
    };

    window.addEventListener('ai-response-chunk', handleAIResponseChunk as EventListener);
    window.addEventListener('ai-response-start', handleAIResponseStart as EventListener);
    window.addEventListener('ai-response-complete', handleAIResponseComplete as EventListener);
    
    return () => {
      window.removeEventListener('ai-response-chunk', handleAIResponseChunk as EventListener);
      window.removeEventListener('ai-response-start', handleAIResponseStart as EventListener);
      window.removeEventListener('ai-response-complete', handleAIResponseComplete as EventListener);
    };
  }, [streamingAnswer]);

  const clearResponses = () => {
    setCurrentAnswer(null);
    setStreamingAnswer('');
    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-full p-4 border rounded-lg shadow-md bg-white">
      {/* Content - One simple box with scrolling */}
      <div className="flex-1 overflow-y-auto pr-2">
        {!currentAnswer && !isStreaming ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No AI Responses Yet
            </h4>
            <p className="text-sm text-gray-600">
              Click "Get Answer" in the Live Transcript panel to see AI-generated responses here.
            </p>
          </div>
        ) : (
          <div>
            {/* Streaming AI Response */}
            {isStreaming && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <h4 className="text-lg font-semibold text-blue-700">
                    AI Response (Streaming...)
                  </h4>
                </div>
                
                <div 
                  className="text-gray-900 whitespace-pre-line leading-relaxed"
                  style={{
                    fontSize: streamingAnswer.length > 800 ? '14px' : '16px',
                    lineHeight: '1.6'
                  }}
                >
                  {streamingAnswer}
                  <span style={{ 
                    animation: 'blink 1s infinite',
                    fontWeight: 'bold',
                    color: '#007bff'
                  }}>|</span>
                </div>
              </div>
            )}

            {/* Current Answer */}
            {currentAnswer && !isStreaming && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <BrainCircuit className="w-5 h-5 text-green-600" />
                  <h4 className="text-lg font-semibold text-green-700">
                    AI Response
                  </h4>
                </div>
                
                <div 
                  className="text-gray-900 whitespace-pre-line leading-relaxed"
                  style={{
                    fontSize: currentAnswer.answer.length > 800 ? '14px' : '16px',
                    lineHeight: '1.6'
                  }}
                >
                  {currentAnswer.answer}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptSummary;