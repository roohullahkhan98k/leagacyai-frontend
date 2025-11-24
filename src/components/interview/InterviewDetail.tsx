import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, Calendar, MessageSquare, Copy, Check, Download, Loader2, Trash2 } from 'lucide-react';
import { Interview, interviewApi } from '../../services/interviewApi';
import Button from '../ui/Button';
import Card from '../ui/Card';
import DeleteInterviewModal from './DeleteInterviewModal';
import { toast } from 'react-toastify';

interface InterviewDetailProps {
  interview: Interview | null;
  sessionId?: string;
  onBack: () => void;
}

const InterviewDetail = ({ interview: initialInterview, sessionId, onBack }: InterviewDetailProps) => {
  const [interview, setInterview] = useState<Interview | null>(initialInterview);
  const [isLoading, setIsLoading] = useState(!initialInterview && !!sessionId);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInterview = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await interviewApi.getInterview(sessionId);
      setInterview(response.interview);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load interview';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialInterview && sessionId) {
      loadInterview(sessionId);
    }
  }, [initialInterview, sessionId, loadInterview]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const calculateDuration = (startedAt: string, endedAt?: string) => {
    if (!endedAt) return 'Active';
    
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    if (minutes === 0) {
      return `${seconds} seconds`;
    }
    return `${minutes} minutes ${seconds} seconds`;
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!interview) return;

    setIsDeleting(true);

    try {
      await interviewApi.deleteInterview(interview.session_id);
      
      toast.success(`Interview "${interview.title}" deleted successfully`, {
        position: 'top-right',
        autoClose: 3000,
      });
      
      setShowDeleteModal(false);
      // Navigate back after successful deletion
      onBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete interview';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const exportTranscript = () => {
    if (!interview) return;

    let content = `${interview.title}\n`;
    content += `Date: ${formatDate(interview.started_at)}\n`;
    content += `Duration: ${calculateDuration(interview.started_at, interview.ended_at)}\n`;
    content += `Total Q&A: ${interview.total_qa}\n\n`;
    content += '='.repeat(50) + '\n\n';

    interview.qa_pairs.forEach((qa, index) => {
      content += `Q${index + 1} [${formatTimestamp(qa.timestamp)}]:\n${qa.question}\n\n`;
      content += `A${index + 1}:\n${qa.answer}\n\n`;
      content += '-'.repeat(50) + '\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${interview.title.replace(/\s+/g, '_')}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Transcript exported', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading interview...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-error-600 dark:text-error-400 mb-4">{error}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </div>
      </Card>
    );
  }

  if (!interview) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Interview not found</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button onClick={exportTranscript} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button 
            onClick={handleDeleteClick} 
            variant="outline" 
            size="sm"
            className="border-error-600 text-error-600 hover:bg-error-50 dark:border-error-400 dark:text-error-400 dark:hover:bg-error-900/30"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Interview Info Card */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {interview?.title || 'Untitled Interview'}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium">Date</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100">{interview?.started_at ? formatDate(interview.started_at) : 'N/A'}</p>
          </div>

          <div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium">Time</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100">{interview?.started_at ? formatTime(interview.started_at) : 'N/A'}</p>
          </div>

          <div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium">Duration</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100">
              {interview?.started_at ? calculateDuration(interview.started_at, interview.ended_at) : 'N/A'}
            </p>
          </div>

          <div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="font-medium">Q&A Pairs</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100">{interview?.total_qa || 0}</p>
          </div>
        </div>
      </Card>

      {/* Q&A Pairs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Interview Transcript
        </h2>

        {!interview?.qa_pairs || interview.qa_pairs.length === 0 ? (
          <Card className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No Q&A pairs recorded in this interview
            </p>
          </Card>
        ) : (
          interview.qa_pairs.map((qa, index) => (
            <Card key={index} className="p-6">
              <div className="space-y-4">
                {/* Question */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mr-3">
                        Q{index + 1}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(qa.timestamp)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(qa.question, index * 2)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedIndex === index * 2 ? (
                        <Check className="h-4 w-4 text-success-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 pl-9 whitespace-pre-wrap">
                    {qa.question}
                  </p>
                </div>

                {/* Answer */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 text-sm font-semibold">
                      A{index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(qa.answer, index * 2 + 1)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedIndex === index * 2 + 1 ? (
                        <Check className="h-4 w-4 text-success-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 pl-9 whitespace-pre-wrap">
                    {qa.answer}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {interview && (
        <DeleteInterviewModal
          isOpen={showDeleteModal}
          interviewTitle={interview.title}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default InterviewDetail;

