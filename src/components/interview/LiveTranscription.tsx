import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Button from '../ui/Button';
import { Trash2, Loader2, AlertCircle, Mic, MicOff, Brain, Sparkles } from 'lucide-react';
import { interviewApi } from '../../services/interviewApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

interface LiveTranscriptionProps {
  isActive: boolean;
  stream: MediaStream | null;
}

export interface LiveTranscriptionRef {
  stopListening: (title?: string) => void;
}

const LiveTranscription = forwardRef<LiveTranscriptionRef, LiveTranscriptionProps>(({ isActive, stream }, ref) => {
  const [transcript, setTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscriptCleared, setIsTranscriptCleared] = useState(false); // Flag to prevent updates after clearing
  const processedSegments = useRef(new Set()); // Track processed segments to prevent duplicates
  
  // Interview session tracking
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const interviewIdRef = useRef<string | null>(null);
  const currentQuestionRef = useRef<string>('');
  const currentAnswerRef = useRef<string>('');
  const isAwaitingAnswerRef = useRef<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    if (isActive && stream) {
      startListening(stream);
    } else if (!isActive) {
      stopListening();
    }
  }, [isActive, stream]);

  const startListening = async (stream: MediaStream) => {
    setTranscript('');
    setError(null);
    setIsProcessing(true);
    setIsTranscriptCleared(false); // Reset the cleared flag
    processedSegments.current.clear(); // Clear processed segments

    // Generate session ID for this interview
    sessionIdRef.current = crypto.randomUUID();
    console.log('🎯 Generated session ID:', sessionIdRef.current);

    // Connect to WebSocket backend
    const socketUrl = (import.meta as any).env?.VITE_SOCKET_URL as string | undefined;
    
    if (!socketUrl) {
      setError('WebSocket URL not configured. Please set VITE_SOCKET_URL in your environment.');
      setIsProcessing(false);
      return;
    }
    
    console.log('🔌 Connecting to WebSocket:', socketUrl);
    socketRef.current = new WebSocket(socketUrl);
    socketRef.current.binaryType = 'arraybuffer';

    socketRef.current.onopen = async () => {
      console.log('✅ Connected to AI Interview backend');
      setIsConnected(true);
      
      // Start interview via API (silently, no toast notifications)
      try {
        const response = await interviewApi.startInterview(
          sessionIdRef.current!,
          user?.id
        );
        interviewIdRef.current = response.interview_id;
        console.log('✅ Interview started with ID:', response.interview_id);
      } catch (error) {
        console.error('❌ Failed to start interview:', error);
        // Silent failure - interview can still work via WebSocket
      }
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received message:', data.type);
        
        switch (data.type) {
          case 'transcript_update':
            console.log('📝 Transcript update received:', data);
            
            // Don't update transcript if it was cleared for AI response
            if (isTranscriptCleared) {
              console.log('🚫 Transcript updates blocked - transcript was cleared for AI response');
              return;
            }
            
            // Check for duplicate segments
            const segmentId = data.segmentId || `seg_${Date.now()}`;
            if (processedSegments.current.has(segmentId)) {
              console.log('🔄 Duplicate segment detected, skipping:', segmentId);
              return;
            }
            
            // Mark segment as processed
            processedSegments.current.add(segmentId);
            
            if (data.isPartial) {
              // For partial transcripts, show the accumulated transcript with current segment
              setTranscript(data.transcript || '');
              console.log('📝 Partial transcript updated:', data.transcript);
            } else {
              // For final transcripts, this is the complete accumulated transcript
              setTranscript(data.transcript || '');
              console.log('📝 Final transcript updated:', data.transcript);
            }
            break;
            
          case 'ai_response_chunk':
            console.log('🤖 AI Response chunk received:', data.chunk);
            // Dispatch event to TranscriptSummary component
            window.dispatchEvent(new CustomEvent('ai-response-chunk', {
              detail: {
                chunk: data.chunk,
                isComplete: data.isComplete,
                progress: data.progress,
                responseId: `response-${Date.now()}`
              }
            }));
            break;
            
          case 'ai_response_complete':
            console.log('✅ AI Response streaming completed');
            
            // Save Q&A pair to database if we have both question and answer
            if (sessionIdRef.current && currentQuestionRef.current && data.fullResponse) {
              saveQAPair(currentQuestionRef.current, data.fullResponse);
              // Reset for next Q&A
              currentQuestionRef.current = '';
              isAwaitingAnswerRef.current = false;
            }
            
            // Dispatch event to TranscriptSummary component
            window.dispatchEvent(new CustomEvent('ai-response-complete', {
              detail: {
                fullResponse: data.fullResponse,
                responseId: `response-${Date.now()}`
              }
            }));
            break;
            
          case 'heartbeat':
            console.log('💓 Heartbeat received');
            break;
            
          case 'error':
            console.error('❌ Backend Error:', data.message);
            setError(data.message);
            break;
            
          default:
            console.log('📨 Unknown message type:', data.type);
        }
      } catch (err) {
        console.error('❌ Error parsing message:', err);
      }
    };

    socketRef.current.onclose = (event) => {
      console.log('❌ Disconnected from backend:', event.code, event.reason);
      setIsConnected(false);
      setError('Connection lost. Please refresh the page.');
    };

    socketRef.current.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
      setError('Failed to connect to AI Interview backend.');
      setIsConnected(false);
    };

    try {
      console.log('🎵 Setting up shared screen audio...');
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      console.log('🎵 AudioContext created with sample rate:', audioContext.sampleRate);

      const audioTracks = stream.getAudioTracks();
      console.log('🎵 Audio tracks found:', audioTracks.length);
      
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found in the stream');
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create audio processor to convert to Float32Array
      const bufferSize = 2048;
      processorRef.current = audioContext.createScriptProcessor(bufferSize, 1, 1);
      
      processorRef.current.onaudioprocess = (event) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          const inputData = event.inputBuffer.getChannelData(0);
          const float32Array = new Float32Array(inputData);
          
          // Only send if WebSocket buffer is not full (prevent overflow)
          if (socketRef.current.bufferedAmount < 1024 * 1024) { // 1MB limit
            socketRef.current.send(float32Array.buffer);
          }
        }
      };
      
      source.connect(processorRef.current);
      processorRef.current.connect(audioContext.destination);
      
      setIsProcessing(false);
    } catch (err) {
      console.error('❌ Error setting up audio:', err);
      setError('Failed to start screen share with audio.');
      setIsProcessing(false);
    }
  };

  const saveQAPair = async (question: string, answer: string) => {
    if (!sessionIdRef.current) {
      console.error('❌ No session ID available');
      return;
    }

    try {
      const response = await interviewApi.addQAPair(
        sessionIdRef.current,
        question,
        answer
      );
      console.log(`✅ Q&A pair saved. Total: ${response.total_qa}`);
    } catch (error) {
      console.error('❌ Failed to save Q&A pair:', error);
      // Don't show toast for this - continue interview even if save fails
    }
  };

  const stopListening = async (title?: string) => {
    setIsProcessing(false);
    setIsConnected(false);
    
    // End interview via API
    if (sessionIdRef.current) {
      try {
        const response = await interviewApi.endInterview(
          sessionIdRef.current, 
          title || undefined
        );
        console.log('✅ Interview ended:', response.interview.title);
        toast.success(`Interview saved: ${response.interview.title}`, {
          position: 'top-right',
          autoClose: 3000,
        });
        
        // Dispatch event with complete interview data
        window.dispatchEvent(new CustomEvent('interview-ended', {
          detail: {
            interview: response.interview
          }
        }));
      } catch (error) {
        console.error('❌ Failed to end interview:', error);
        toast.error('Failed to save interview', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      
      // Reset session tracking
      sessionIdRef.current = null;
      interviewIdRef.current = null;
      currentQuestionRef.current = '';
      currentAnswerRef.current = '';
      isAwaitingAnswerRef.current = false;
    }
    
    processorRef.current?.disconnect();
    processorRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'end_interview' }));
    }

    socketRef.current?.close();
    socketRef.current = null;
  };

  const getTranscriptAnswer = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('🤖 Sending transcript answer request...');
      console.log('📝 Current transcript to send:', transcript);
      
      // Store current transcript as the question
      currentQuestionRef.current = transcript;
      isAwaitingAnswerRef.current = true;
      
      const responseId = `response-${Date.now()}`;
      
      // Dispatch start event to TranscriptSummary component
      window.dispatchEvent(new CustomEvent('ai-response-start', {
        detail: {
          transcript: transcript,
          style: 'professional',
          responseId: responseId
        }
      }));

      try {
        socketRef.current.send(JSON.stringify({ 
          type: 'get_transcript_answer',
          style: 'professional'
        }));
        console.log('✅ Transcript answer request sent successfully');
        
        // Clear the transcript after sending to AI (VCR-like behavior)
        setTranscript('');
        setIsTranscriptCleared(true); // Set flag to prevent future updates
        processedSegments.current.clear(); // Clear processed segments too
        console.log('🧹 Transcript cleared after sending to AI');
      } catch (error) {
        console.error('❌ Failed to send transcript answer request:', error);
        setError('Failed to send request to server');
      }
    } else {
      console.error('❌ WebSocket not connected');
      setError('WebSocket not connected. Please restart recording.');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setIsTranscriptCleared(false); // Reset the flag to allow new transcript updates
    processedSegments.current.clear();
  };

  // Expose stopListening function to parent component
  useImperativeHandle(ref, () => ({
    stopListening
  }));

  return (
    <div className="flex flex-col h-full p-4 border rounded-lg shadow-md bg-white">
      {/* Transcript Content - One simple box with scrolling */}
      <div 
        className="flex-1 overflow-y-auto pr-2"
        style={{
          fontStyle: transcript ? 'normal' : 'italic',
          color: transcript ? '#000' : '#6c757d',
          fontSize: transcript && transcript.length > 500 ? '14px' : '16px',
          lineHeight: '1.6',
          minHeight: '120px'
        }}
      >
        {transcript || (isTranscriptCleared ? 'Ready for new question...' : 'Waiting for speech...')}
      </div>
      
      {/* Get Answer Button - At the end of the box */}
      {transcript && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={getTranscriptAnswer}
            disabled={!isConnected}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-all duration-200"
          >
            <Brain className="w-4 h-4" />
            <Sparkles className="w-4 h-4" />
            Get Answer
          </button>
        </div>
      )}
    </div>
  );
});

export default LiveTranscription;