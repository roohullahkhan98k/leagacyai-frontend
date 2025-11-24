import { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, MessageSquare, Trash2, Eye, RefreshCw, Loader2 } from 'lucide-react';
import { interviewApi, Interview } from '../../services/interviewApi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import DeleteInterviewModal from './DeleteInterviewModal';
import { toast } from 'react-toastify';

interface InterviewHistoryProps {
  onViewInterview?: (interview: Interview) => void;
}

const InterviewHistory = ({ onViewInterview }: InterviewHistoryProps) => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; interview: Interview | null }>({
    isOpen: false,
    interview: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInterviews = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await interviewApi.getUserInterviews(user.id);
      setInterviews(response.interviews);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load interviews';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  // Listen for new interviews
  useEffect(() => {
    const handleInterviewEnded = () => {
      loadInterviews();
    };

    window.addEventListener('interview-ended', handleInterviewEnded);
    return () => {
      window.removeEventListener('interview-ended', handleInterviewEnded);
    };
  }, [loadInterviews]);

  const handleDeleteClick = (interview: Interview) => {
    setDeleteModal({ isOpen: true, interview });
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, interview: null });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.interview) return;

    setIsDeleting(true);

    try {
      await interviewApi.deleteInterview(deleteModal.interview.session_id);
      
      toast.success(`Interview "${deleteModal.interview.title}" deleted successfully`, {
        position: 'top-right',
        autoClose: 3000,
      });
      
      setDeleteModal({ isOpen: false, interview: null });
      loadInterviews();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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

  const calculateDuration = (startedAt: string, endedAt?: string) => {
    if (!endedAt) return 'Active';
    
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    if (minutes === 0) {
      return `${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your interview history
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading interviews...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-error-600 dark:text-error-400 mb-4">{error}</p>
          <Button onClick={loadInterviews} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No interviews yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start your first AI interview to see it here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Interview History
        </h2>
        <Button onClick={loadInterviews} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {interviews.map((interview) => (
          <Card
            key={interview.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {interview.title}
                </h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(interview.started_at)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatTime(interview.started_at)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>{interview.total_qa} Q&A pairs</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{calculateDuration(interview.started_at, interview.ended_at)}</span>
                  </div>
                </div>

                {interview.status === 'active' && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {onViewInterview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewInterview(interview)}
                    className="h-9 w-9 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(interview)}
                  className="h-9 w-9 p-0 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteInterviewModal
        isOpen={deleteModal.isOpen}
        interviewTitle={deleteModal.interview?.title || ''}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default InterviewHistory;

