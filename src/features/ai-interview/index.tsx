import { useState, useRef, useEffect } from 'react';
import { Settings, History, Video, Sparkles, Zap, Mic, BrainCircuit, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/layout/PageContainer';
import InterviewControls from '../../components/interview/InterviewControls';
import LiveTranscription, { LiveTranscriptionRef } from '../../components/interview/LiveTranscription';
import DraggablePanel from '../../components/ui/DraggablePanel';
import ScreenShare from '../../components/interview/ScreenShare';
import TranscriptSummary from '../../components/interview/TranscriptSummary';
import InterviewHistory from '../../components/interview/InterviewHistory';
import InterviewDetail from '../../components/interview/InterviewDetail';
import EndInterviewModal from '../../components/interview/EndInterviewModal';
import { useInterview } from '../../App';
import { Interview } from '../../services/interviewApi';

type ViewMode = 'start' | 'active' | 'history' | 'detail';

const InterviewPage = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('start');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isSavingInterview, setIsSavingInterview] = useState(false);

  const { isInterviewActive, setIsInterviewActive } = useInterview();
  const liveTranscriptionRef = useRef<LiveTranscriptionRef | null>(null);
  const PANEL_GAP = 20;
  const CONTROLS_HEIGHT = 80;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStartInterview = async () => {
    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      setStream(mediaStream);
      setIsInterviewActive(true);
      setViewMode('active');
      setScreenShareError(null);
    } catch (error) {
      setScreenShareError('Failed to start screen sharing. Please make sure you have granted the necessary permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopInterview = () => {
    // Show the title modal before stopping
    setShowEndModal(true);
  };

  const handleConfirmEndInterview = async (title: string) => {
    setIsSavingInterview(true);
    
    try {
      // Stop the live transcription with the title
      if (liveTranscriptionRef.current) {
        await liveTranscriptionRef.current.stopListening(title);
      }
      
      // Stop media stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setIsInterviewActive(false);
      setViewMode('start');
      setShowEndModal(false);
    } catch (error) {
      console.error('Error ending interview:', error);
    } finally {
      setIsSavingInterview(false);
    }
  };

  const handleCancelEndInterview = () => {
    setShowEndModal(false);
  };

  const handleViewInterview = (interview: Interview) => {
    // Pass the session_id to let InterviewDetail load full data
    setSelectedInterview(interview);
    setViewMode('detail');
  };

  const handleBackToHistory = () => {
    setSelectedInterview(null);
    setViewMode('history');
  };

  const handleBackToStart = () => {
    setSelectedInterview(null);
    setViewMode('start');
  };

  const handleStreamReady = (mediaStream: MediaStream) => {
    console.log('Stream is ready for WebRTC');
  };

  return (
    <div className="w-full min-h-screen overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {viewMode === 'start' && !isInterviewActive && (
        <div className="relative w-full min-h-screen flex items-center justify-center py-12 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className={`w-full max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Powered Interview Assistant
                </span>
              </div>
            </div>

            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Interview
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">Assistant</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Get real-time AI assistance during your interview with live transcription and intelligent answer suggestions powered by advanced AI.
              </p>
            </div>

            <div className="space-y-8">
              {/* How It Works Card */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    How It Works
                  </h2>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-purple-700/30 hover:shadow-md transition-all duration-200">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                      1
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg pt-2">Join your interview call (Zoom, Teams, or Google Meet)</p>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-pink-700/30 hover:shadow-md transition-all duration-200">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                      2
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg pt-2">Click "Start Interview" and share your screen with audio</p>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200/50 dark:border-blue-700/30 hover:shadow-md transition-all duration-200">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                      3
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg pt-2">Get real-time transcription and AI-powered answer suggestions</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  size="lg"
                  onClick={handleStartInterview}
                  disabled={isLoading}
                  className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  <Video className="h-5 w-5 mr-2" />
                  {isLoading ? 'Starting...' : 'Start Interview'}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setViewMode('history')}
                  className="text-lg px-8 py-4 border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 w-full sm:w-auto"
                >
                  <History className="h-5 w-5 mr-2" />
                  View History
                </Button>
              </div>

              {screenShareError && (
                <div className="bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm text-red-700 dark:text-red-300 p-4 rounded-xl border border-red-200 dark:border-red-800 shadow-lg">
                  <p className="text-sm font-medium">{screenShareError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'history' && (
        <div className="relative w-full min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="mb-6">
              <Button 
                onClick={handleBackToStart} 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Start
              </Button>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
              <InterviewHistory onViewInterview={handleViewInterview} />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'detail' && selectedInterview && (
        <div className="relative w-full min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
              <InterviewDetail 
                interview={null}
                sessionId={selectedInterview.session_id}
                onBack={handleBackToHistory} 
              />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'active' && isInterviewActive && (
        <>
          {/* Screen Share Panel */}
          <DraggablePanel
            title="Screen Share"
            defaultPosition={{ x: PANEL_GAP, y: PANEL_GAP }}
            defaultSize={{ 
              width: window.innerWidth / 3 - PANEL_GAP * 1.5, 
              height: window.innerHeight - PANEL_GAP * 2 - CONTROLS_HEIGHT 
            }}
            minWidth={400}
            minHeight={300}
          >
            <ScreenShare
              isActive={isInterviewActive}
              onStart={handleStartInterview}
              onStop={handleStopInterview}
              stream={stream}
              error={screenShareError}
              isLoading={isLoading}
              onStreamReady={handleStreamReady}
            />
          </DraggablePanel>

          {/* Live Transcription Panel */}
          <DraggablePanel
            title="Live Transcription"
            defaultPosition={{
              x: window.innerWidth / 3 + PANEL_GAP / 2,
              y: PANEL_GAP,
            }}
            defaultSize={{
              width: (window.innerWidth * 2) / 3 - PANEL_GAP * 2,
              height: (window.innerHeight - PANEL_GAP * 3 - CONTROLS_HEIGHT) / 2,
            }}
          >
            <LiveTranscription 
              ref={liveTranscriptionRef} 
              isActive={isInterviewActive} 
              stream={stream} 
            />
          </DraggablePanel>

          {/* Error Message - Above Live Transcription */}
          {screenShareError && (
            <div 
              className="fixed z-50 top-4 right-4 max-w-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg"
              style={{
                left: `${window.innerWidth / 3 + PANEL_GAP / 2}px`,
                top: `${PANEL_GAP}px`,
                width: `${(window.innerWidth * 2) / 3 - PANEL_GAP * 2}px`
              }}
            >
              <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {screenShareError}
              </div>
            </div>
          )}

          {/* AI Answers Panel */}
          <DraggablePanel
            title="AI Answers"
            defaultPosition={{ 
              x: window.innerWidth / 3 + PANEL_GAP / 2, 
              y: PANEL_GAP * 2 + (window.innerHeight - PANEL_GAP * 3 - CONTROLS_HEIGHT) / 2 
            }}
            defaultSize={{ 
              width: (window.innerWidth * 2) / 3 - PANEL_GAP * 2, 
              height: (window.innerHeight - PANEL_GAP * 3 - CONTROLS_HEIGHT) / 2 
            }}
          >
            <TranscriptSummary
              transcript=""
              isActive={isInterviewActive}
            />
          </DraggablePanel>

          {/* Interview Controls */}
          <InterviewControls
            onStart={handleStartInterview}
            onStop={handleStopInterview}
            onOpenSettings={() => setShowSettings(true)}
            isActive={isInterviewActive}
          />

          {/* End Interview Modal */}
          <EndInterviewModal
            isOpen={showEndModal}
            onClose={handleCancelEndInterview}
            onConfirm={handleConfirmEndInterview}
            isLoading={isSavingInterview}
          />
        </>
      )}
    </div>
  );
};

export default InterviewPage;