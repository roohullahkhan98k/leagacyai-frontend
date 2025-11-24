import { useState, useRef, useEffect } from 'react';
import { X, Edit2, Save, Trash2, Video, Play, Mic, Square, Upload, Loader2 } from 'lucide-react';
import { AvatarRecord, updateMetadata, absoluteAssetUrl, startAudioToLipsync, getPipelineJob } from '../../services/avatarApi';
import Button from '../ui/Button';
import AvatarViewer from '../ui/AvatarViewer';
import FileUpload from '../ui/FileUpload';
import LipSyncModal from '../ui/LipSyncModal';
import { toast } from 'react-toastify';

interface AvatarViewModalProps {
  avatar: AvatarRecord;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (avatar: AvatarRecord) => void;
}

const AvatarViewModal = ({ avatar, isOpen, onClose, onDelete, onUpdate }: AvatarViewModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(avatar.name);
  const [editDesc, setEditDesc] = useState(avatar.description || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  
  // Lipsync pipeline
  const [audioJobId, setAudioJobId] = useState<string | null>(null);
  const [audioJobStatus, setAudioJobStatus] = useState<'idle' | 'queued' | 'running' | 'completed' | 'failed'>('idle');
  const [audioJobError, setAudioJobError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  
  // Playback
  const [lipSyncModalOpen, setLipSyncModalOpen] = useState(false);
  const [playbackConfig, setPlaybackConfig] = useState<{ modelUrl: string; lipsyncUrl?: string; audioUrl?: string } | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateMetadata(avatar.id, {
        name: editName,
        description: editDesc,
      });
      onUpdate(res.avatar);
      setIsEditing(false);
      toast.success('Avatar updated successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update avatar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    onDelete(avatar.id);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('Failed to start recording. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const handleAudioToLipsync = async (file: File) => {
    setAudioJobError(null);
    setAudioJobStatus('queued');
    try {
      const start = await startAudioToLipsync(avatar.id, file);
      setAudioJobId(start.jobId);
      pollJob(start.jobId);
    } catch (e: any) {
      setAudioJobStatus('failed');
      setAudioJobError(e?.message || 'Failed to start audio→lipsync');
      toast.error(e?.message || 'Failed to start lipsync generation');
    }
  };

  const handleRecordedAudioToLipsync = async () => {
    if (!audioBlob) return;
    const audioFile = new File([audioBlob], 'recorded-audio.wav', { type: 'audio/wav' });
    handleAudioToLipsync(audioFile);
  };

  const pollJob = (jobId: string) => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await getPipelineJob(jobId);
        const status = res.job.status;
        if (status === 'queued' || status === 'running') {
          setAudioJobStatus(status);
          return;
        }
        if (status === 'completed') {
          if (pollRef.current) {
            window.clearInterval(pollRef.current);
            pollRef.current = null;
          }
          setAudioJobStatus('completed');
          toast.success('Lipsync animation generated successfully!');
          // Refresh avatar data here if needed
        } else if (status === 'failed') {
          if (pollRef.current) {
            window.clearInterval(pollRef.current);
            pollRef.current = null;
          }
          setAudioJobStatus('failed');
          setAudioJobError(res.job.error || 'Pipeline job failed');
          toast.error(res.job.error || 'Lipsync generation failed');
        }
      } catch (err: any) {
        if (pollRef.current) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setAudioJobStatus('failed');
        setAudioJobError(err?.message || 'Polling failed');
      }
    }, 1500) as unknown as number;
  };

  const handleOpenLipSync = () => {
    const modelUrl = avatar.model?.url ? absoluteAssetUrl(avatar.model.url) : undefined;
    const latestLipsync = avatar.lipsync && avatar.lipsync.length > 0 
      ? avatar.lipsync[avatar.lipsync.length - 1] 
      : null;
    const lipsyncUrl = latestLipsync?.url ? absoluteAssetUrl(latestLipsync.url) : undefined;
    const audioUrl = avatar.audio?.url ? absoluteAssetUrl(avatar.audio.url) : undefined;
    
    if (!modelUrl) {
      toast.error('No model URL available');
      return;
    }
    
    setPlaybackConfig({ modelUrl, lipsyncUrl, audioUrl });
    setLipSyncModalOpen(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-bold bg-white dark:bg-gray-800 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {avatar.name}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 3D Model Viewer */}
          <div>
            <h3 className="text-lg font-semibold mb-3">3D Model</h3>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
              <AvatarViewer 
                modelUrl={avatar.model?.url ? absoluteAssetUrl(avatar.model.url) : undefined}
                className="h-96 w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            {isEditing ? (
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none"
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                {avatar.description || 'No description'}
              </p>
            )}
          </div>

          {/* Add Lipsync */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mic className="h-5 w-5 text-purple-600" />
              Add Lipsync Animation
            </h3>
            
            {/* Audio Recording */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Record Audio
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  {!isRecording ? (
                    <Button onClick={startRecording} size="sm">
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white" size="sm">
                      <Square className="h-4 w-4 mr-2" />
                      Stop ({formatTime(recordingTime)})
                    </Button>
                  )}
                  {audioUrl && (
                    <>
                      <audio controls src={audioUrl} className="h-8" />
                      <Button onClick={handleRecordedAudioToLipsync} size="sm" disabled={audioJobStatus === 'queued' || audioJobStatus === 'running'}>
                        {audioJobStatus === 'queued' || audioJobStatus === 'running' ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Generate Lipsync
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Or Upload Audio File</h4>
                <FileUpload accept=".wav,.mp3,.m4a" maxSize={50} onFileSelect={handleAudioToLipsync} />
              </div>

              {/* Status */}
              {audioJobId && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>{' '}
                  <span className={`font-medium capitalize ${
                    audioJobStatus === 'completed' ? 'text-green-600' :
                    audioJobStatus === 'failed' ? 'text-red-600' :
                    audioJobStatus === 'running' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>{audioJobStatus}</span>
                </div>
              )}
              {audioJobError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                  {audioJobError}
                </div>
              )}
            </div>
          </div>

          {/* Animations */}
          {avatar.lipsync && avatar.lipsync.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Lipsync Animations ({avatar.lipsync.length})</h3>
                <Button onClick={handleOpenLipSync} size="sm" variant="outline" className="text-purple-600 border-purple-300">
                  <Video className="h-4 w-4 mr-2" />
                  View Lipsync
                </Button>
              </div>
              <div className="space-y-2">
                {avatar.lipsync.map((lipsync) => (
                  <div
                    key={lipsync.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{lipsync.url.split('/').pop()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(lipsync.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio */}
          {avatar.audio?.url && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Audio</h3>
              <audio controls src={absoluteAssetUrl(avatar.audio.url)} className="w-full" />
            </div>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-500 dark:text-gray-500">
            <p>Created: {new Date(avatar.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(avatar.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {isEditing ? (
            <div className="flex gap-2 w-full">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(avatar.name);
                  setEditDesc(avatar.description || '');
                }}
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex-1"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Lipsync Playback Modal */}
      {playbackConfig && (
        <LipSyncModal
          isOpen={lipSyncModalOpen}
          onClose={() => setLipSyncModalOpen(false)}
          modelUrl={playbackConfig.modelUrl}
          lipsyncUrl={playbackConfig.lipsyncUrl || ''}
          audioUrl={playbackConfig.audioUrl}
        />
      )}
    </div>
  );
};

export default AvatarViewModal;

