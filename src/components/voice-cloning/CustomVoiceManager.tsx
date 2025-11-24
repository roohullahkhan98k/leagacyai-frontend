import { useState, useEffect, useCallback } from 'react';
import { Trash2, Settings, Calendar, Loader2, RefreshCw, Star, Play, AlertTriangle, Sparkles } from 'lucide-react';
import { CustomVoice, getCustomVoices, deleteVoice } from '../../services/voiceCloningApi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { toast } from 'react-toastify';

interface CustomVoiceManagerProps {
  onVoiceDeleted?: () => void;
}

const CustomVoiceManager = ({ onVoiceDeleted }: CustomVoiceManagerProps) => {
  const { user } = useAuth();
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingVoiceId, setDeletingVoiceId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [voiceToDelete, setVoiceToDelete] = useState<CustomVoice | null>(null);

  const loadCustomVoices = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getCustomVoices();
      setCustomVoices(response.voices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load custom voices';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCustomVoices();
  }, [loadCustomVoices]);

  const handleDeleteClick = (voice: CustomVoice) => {
    setVoiceToDelete(voice);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!voiceToDelete) return;

    setDeletingVoiceId(voiceToDelete.voice_id);

    try {
      await deleteVoice(voiceToDelete.voice_id);
      
      toast.success(`Voice "${voiceToDelete.voice_name}" deleted successfully`, {
        position: 'top-right',
        autoClose: 3000,
      });
      
      setCustomVoices(customVoices.filter(v => v.voice_id !== voiceToDelete.voice_id));
      setShowDeleteModal(false);
      setVoiceToDelete(null);
      
      if (onVoiceDeleted) {
        onVoiceDeleted();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete voice';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setDeletingVoiceId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your custom voices
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            My Custom Voices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading custom voices...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            My Custom Voices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-error-600 dark:text-error-400 mb-4">{error}</p>
            <Button onClick={loadCustomVoices} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              My Custom Voices
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                {customVoices.length} voice{customVoices.length !== 1 ? 's' : ''}
              </span>
              <Button onClick={loadCustomVoices} variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customVoices.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No custom voices yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Clone your voice to create custom voice clones
              </p>
              <Button
                onClick={() => {/* Navigate to record tab */}}
                variant="outline"
                className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create Voice Clone
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customVoices.map((voice) => {
                const isDeleting = deletingVoiceId === voice.voice_id;
                
                return (
                  <div
                    key={voice.voice_id}
                    className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-purple-600" />
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                              {voice.voice_name}
                            </h4>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(voice.created_at)}</span>
                          </div>

                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Voice ID: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                              {voice.voice_id.slice(0, 12)}...
                            </code>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/30"
                          disabled={isDeleting}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Test Voice
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteClick(voice)}
                          variant="ghost"
                          size="sm"
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 px-3"
                        >
                          {isDeleting ? (
                            <div className="h-4 w-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && voiceToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deletingVoiceId && setShowDeleteModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            {/* Close button */}
            {!deletingVoiceId && (
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            )}

            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-100 dark:bg-error-900/30 mb-4">
              <AlertTriangle className="h-6 w-6 text-error-600 dark:text-error-400" />
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Delete Custom Voice?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">"{voiceToDelete.voice_name}"</span>?
              </p>
              <p className="text-sm text-error-600 dark:text-error-400 mt-2">
                This action cannot be undone. The voice will be removed from ElevenLabs and your account.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={!!deletingVoiceId}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteConfirm}
                disabled={!!deletingVoiceId}
                className="border-error-600 text-error-600 hover:bg-error-50 dark:border-error-400 dark:text-error-400 dark:hover:bg-error-900/30"
              >
                {deletingVoiceId ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-error-600/30 border-t-error-600 dark:border-error-400/30 dark:border-t-error-400 rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Yes, Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomVoiceManager;

