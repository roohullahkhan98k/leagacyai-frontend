import { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, MessageSquare, Trash2, Eye, RefreshCw, Loader2, Sparkles, TrendingUp } from 'lucide-react';
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
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Please log in to view your interview history
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-20 animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 relative" />
          </div>
          <span className="ml-4 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading interviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-6 text-lg font-medium">{error}</p>
          <Button 
            onClick={loadInterviews} 
            variant="outline" 
            size="sm"
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-purple-700 hover:from-blue-100 hover:to-purple-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="py-8">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 mb-6">
            <MessageSquare className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            No interviews yet
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Start your first AI interview to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Interview History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'} total
            </p>
          </div>
        </div>
        <Button 
          onClick={loadInterviews} 
          variant="ghost" 
          size="sm"
          className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 rounded-lg transition-all duration-200"
        >
          <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </Button>
      </div>

      {/* Interview Cards */}
      <div className="space-y-4">
        {interviews.map((interview, index) => (
          <div
            key={interview.id}
            className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-purple-500/10 transform hover:scale-[1.02]"
            style={{ 
              animationDelay: `${index * 50}ms`,
              opacity: 1,
              transform: 'translateY(0)'
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Title with gradient */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-purple-700/30">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {interview.title}
                  </h3>
                </div>
                
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-cyan-700/30">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(interview.started_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-pink-700/30">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatTime(interview.started_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-emerald-700/30">
                    <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{interview.total_qa} Q&A pairs</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200/50 dark:border-red-700/30">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{calculateDuration(interview.started_at, interview.ended_at)}</span>
                  </div>
                </div>

                {/* Status Badge */}
                {interview.status === 'active' && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
                      <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      Active
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                {onViewInterview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewInterview(interview)}
                    className="h-10 w-10 p-0 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 border border-blue-200/50 dark:border-purple-700/30 transition-all duration-200 hover:scale-110"
                  >
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(interview)}
                  className="h-10 w-10 p-0 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/40 dark:hover:to-pink-900/40 border border-red-200/50 dark:border-pink-700/30 transition-all duration-200 hover:scale-110"
                >
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </Button>
              </div>
            </div>
          </div>
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

