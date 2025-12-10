import { useState, useEffect } from 'react';
import { Clock, Play, Download, RefreshCw, Loader2, History as HistoryIcon, Trash2, Globe } from 'lucide-react';
import { AudioHistoryItem, getAudioHistory, deleteGeneratedAudio } from '../../services/voiceCloningApi';
import { ACCENTS } from '../../constants/accents';
import DeleteAudioModal from './DeleteAudioModal';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { toast } from 'react-toastify';

const AudioHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AudioHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AudioHistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadHistory = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAudioHistory(50, 0);
      setHistory(response.history);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audio history';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
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

  const getAccentName = (accentCode?: string) => {
    if (!accentCode) return 'Unknown';
    return ACCENTS.find(a => a.code === accentCode)?.name || accentCode.toUpperCase();
  };

  const handlePlay = async (item: AudioHistoryItem) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }

    if (playingId === item.id) {
      setPlayingId(null);
      return;
    }

    try {
      const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
      const backendUrl = rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';
      const audioUrl = `${backendUrl}${item.audio_file_path}`;
      
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setCurrentAudio(null);
      });
      
      await audio.play();
      setCurrentAudio(audio);
      setPlayingId(item.id);
    } catch (err) {
      toast.error('Failed to play audio', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const handleDownload = (item: AudioHistoryItem) => {
    const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
    const backendUrl = rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';
    const audioUrl = `${backendUrl}${item.audio_file_path}`;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${item.voice_name}_${item.id.slice(0, 8)}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Download started', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      setDeleting(true);
      await deleteGeneratedAudio(pendingDelete.id);
      setHistory(prev => prev.filter(entry => entry.id !== pendingDelete.id));
      setTotal(prev => Math.max(0, prev - 1));
      if (playingId === pendingDelete.id) {
        setPlayingId(null);
        currentAudio?.pause();
        setCurrentAudio(null);
      }
      toast.success('Audio entry deleted', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to delete audio entry', {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your audio history
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading audio history...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-error-600 dark:text-error-400 mb-4">{error}</p>
          <Button onClick={loadHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="py-8">
          <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No audio generated yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate speech to see your audio history here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Audio History ({total})
          </h2>
          <Button onClick={loadHistory} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      {item.voice_name}
                    </span>
                    {/* Accent Badge - NEW */}
                    {(item.accent || item.metadata?.accent) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <Globe className="h-3 w-3 mr-1" />
                        {getAccentName(item.accent || item.metadata?.accent as string)}
                      </span>
                    )}
                    {/* Duration Badge */}
                    {item.duration_seconds > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(item.duration_seconds)}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {item.text}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    {item.file_size_bytes && (
                      <div>
                        {formatFileSize(item.file_size_bytes)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlay(item)}
                    className={`h-9 w-9 p-0 ${playingId === item.id ? 'text-purple-600' : ''}`}
                  >
                    <Play className={`h-4 w-4 ${playingId === item.id ? 'animate-pulse' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(item)}
                    className="h-9 w-9 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDelete(item)}
                    className="h-9 w-9 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <DeleteAudioModal
        open={Boolean(pendingDelete)}
        voiceName={pendingDelete?.voice_name}
        onCancel={() => !deleting && setPendingDelete(null)}
        onConfirm={confirmDelete}
        deleting={deleting}
      />
    </>
  );
};

export default AudioHistory;

