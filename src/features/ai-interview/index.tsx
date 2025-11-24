import { useState, useRef } from 'react';
import { Settings, History, Video } from 'lucide-react';
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
    <PageContainer>
      {viewMode === 'start' && !isInterviewActive && (
        <div className="max-w-2xl mx-auto py-8 md:py-12 px-4">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Interview Assistant</h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Get real-time AI assistance during your interview with live transcription and intelligent responses.
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg md:text-xl font-semibold mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                    1
                  </div>
                  <p>Join your interview call (Zoom, Teams, or Google Meet)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                    2
                  </div>
                  <p>Click "Start Interview" and share your screen with audio</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                    3
                  </div>
                  <p>Get real-time transcription and AI-powered answer suggestions</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                onClick={handleStartInterview}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <Video className="h-5 w-5 mr-2" />
                {isLoading ? 'Starting...' : 'Start Interview'}
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => setViewMode('history')}
                className="w-full sm:w-auto"
              >
                <History className="h-5 w-5 mr-2" />
                View History
              </Button>
            </div>

            {screenShareError && (
              <div className="bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-300 p-4 rounded-lg">
                <p className="text-sm">{screenShareError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'history' && (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-6">
            <Button onClick={handleBackToStart} variant="ghost" size="sm">
              ← Back to Start
            </Button>
          </div>
          <InterviewHistory onViewInterview={handleViewInterview} />
        </div>
      )}

      {viewMode === 'detail' && selectedInterview && (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <InterviewDetail 
            interview={null}
            sessionId={selectedInterview.session_id}
            onBack={handleBackToHistory} 
          />
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
    </PageContainer>
  );
};

export default InterviewPage;