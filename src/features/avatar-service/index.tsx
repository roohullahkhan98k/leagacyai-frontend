import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Trash2, Play, RefreshCcw, Image, Sparkles, Video, Upload, Users, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/layout/PageContainer';
import FileUpload from '../../components/ui/FileUpload';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import LipSyncModal from '../../components/ui/LipSyncModal';
import { listAvatars, deleteAvatar, startImageToModel, getPipelineJob, getAnimationHistory, deleteAnimation, absoluteAssetUrl, type AvatarRecord, type Animation } from '../../services/avatarApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import AvatarViewModal from '../../components/avatar/AvatarViewModal';

const AvatarServicePage = () => {
  const { user } = useAuth();
  const [avatars, setAvatars] = useState<AvatarRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  
  // Animation history state
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [animationsLoading, setAnimationsLoading] = useState(false);
  const [deletingAnimationId, setDeletingAnimationId] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'create' | 'avatars' | 'history'>('create');
  
  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingAvatar, setViewingAvatar] = useState<AvatarRecord | null>(null);
  const [lipSyncModalOpen, setLipSyncModalOpen] = useState(false);
  const [playbackConfig, setPlaybackConfig] = useState<{ modelUrl: string; lipsyncUrl?: string; audioUrl?: string } | null>(null);

  // Pipeline state
  const [imageJobId, setImageJobId] = useState<string | null>(null);
  const [imageJobStatus, setImageJobStatus] = useState<'idle' | 'queued' | 'running' | 'completed' | 'failed'>('idle');
  const [imageJobError, setImageJobError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAvatars();
      setAvatars(res.avatars || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load avatars');
    } finally {
      setLoading(false);
    }
  };

  const loadAnimationHistory = async () => {
    if (!user?.id) return;
    
    setAnimationsLoading(true);
    try {
      const res = await getAnimationHistory(user.id, 50);
      setAnimations(res.animations || []);
    } catch (e: any) {
      console.error('Failed to load animation history:', e);
    } finally {
      setAnimationsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    loadAnimationHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleDeleteAnimation = async (animationId: string) => {
    if (!confirm('Delete this animation? This cannot be undone.')) return;
    
    setDeletingAnimationId(animationId);
    try {
      await deleteAnimation(animationId);
      setAnimations(prev => prev.filter(a => a.id !== animationId));
      toast.success('Animation deleted successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete animation');
    } finally {
      setDeletingAnimationId(null);
    }
  };

  const handleViewAvatar = (avatar: AvatarRecord) => {
    setViewingAvatar(avatar);
    setViewModalOpen(true);
  };

  const handleAvatarUpdated = (updatedAvatar: AvatarRecord) => {
    setAvatars(prev => prev.map(a => a.id === updatedAvatar.id ? updatedAvatar : a));
    setViewingAvatar(updatedAvatar);
  };

  const handleAvatarDeleted = async (id: string) => {
    if (!confirm('Delete this avatar and all its animations? This cannot be undone.')) return;
    
    try {
      await deleteAvatar(id);
      setAvatars(prev => prev.filter(a => a.id !== id));
      setViewModalOpen(false);
      setViewingAvatar(null);
      toast.success('Avatar deleted successfully');
      await refresh();
      await loadAnimationHistory();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete avatar');
    }
  };

  const handlePlayAnimation = (animation: Animation) => {
    const modelUrl = animation.avatar?.model_url ? absoluteAssetUrl(animation.avatar.model_url) : undefined;
    const lipsyncUrl = animation.lipsync_url ? absoluteAssetUrl(animation.lipsync_url) : undefined;
    const audioUrl = animation.audio_url ? absoluteAssetUrl(animation.audio_url) : undefined;
    
    if (!modelUrl) {
      toast.error('Model URL not available for this animation');
      return;
    }
    
    setPlaybackConfig({ modelUrl, lipsyncUrl, audioUrl });
    setLipSyncModalOpen(true);
  };


  // Pipeline helpers
  const pollJob = (jobId: string, onComplete: (result: any) => void, onFail: (message: string) => void, onProgress?: (status: 'queued' | 'running') => void) => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await getPipelineJob(jobId);
        const status = res.job.status;
        if (status === 'queued' || status === 'running') {
          onProgress && onProgress(status);
          return;
        }
        if (status === 'completed') {
          if (pollRef.current) {
            window.clearInterval(pollRef.current);
            pollRef.current = null;
          }
          onComplete(res.job.result);
        } else if (status === 'failed') {
          if (pollRef.current) {
            window.clearInterval(pollRef.current);
            pollRef.current = null;
          }
          onFail(res.job.error || 'Pipeline job failed');
        }
      } catch (err: any) {
        if (pollRef.current) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }
        onFail(err?.message || 'Polling failed');
      }
    }, 1500) as unknown as number;
  };

  useEffect(() => () => { if (pollRef.current) window.clearInterval(pollRef.current); }, []);

  const handleImageToModel = async (file: File) => {
    setImageJobError(null);
    setImageJobStatus('queued');
    try {
      const start = await startImageToModel(file);
      setImageJobId(start.jobId);
      pollJob(
        start.jobId,
        async (result) => {
          setImageJobStatus('completed');
          await refresh();
          if (result?.avatarId) {
            toast.success('Avatar created successfully! Go to My Avatars tab to view it.');
          }
        },
        (msg) => {
          setImageJobStatus('failed');
          setImageJobError(msg);
        },
        (status) => setImageJobStatus(status)
      );
    } catch (e: any) {
      setImageJobStatus('failed');
      setImageJobError(e?.message || 'Failed to start image→model');
    }
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
              Back
          </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refresh} title="Refresh" aria-label="Refresh">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-500 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-white/90 text-sm mb-2">
                <Sparkles className="h-4 w-4" />
                Real-time 3D Avatar Pipeline
              </div>
              <h1 className="text-3xl font-bold mb-1">Avatar Service</h1>
              <p className="text-white/90">Upload a photo → get a rigged 3D model. Add audio → get lipsync. Prepare for playback.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-red-300 text-red-700 rounded bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">{error}</div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200
                ${activeTab === 'create'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Upload className={`h-6 w-6 mb-2 ${activeTab === 'create' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
              <span className="font-semibold text-sm">Create Avatar</span>
              <span className={`text-xs mt-1 ${activeTab === 'create' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-500'}`}>
                Photo → 3D Model
              </span>
              {activeTab === 'create' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rotate-45" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('avatars')}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200
                ${activeTab === 'avatars'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Users className={`h-6 w-6 mb-2 ${activeTab === 'avatars' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
              <span className="font-semibold text-sm">My Avatars</span>
              <span className={`text-xs mt-1 ${activeTab === 'avatars' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-500'}`}>
                {avatars.length} avatar{avatars.length !== 1 ? 's' : ''}
              </span>
              {activeTab === 'avatars' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rotate-45" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200
                ${activeTab === 'history'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <History className={`h-6 w-6 mb-2 ${activeTab === 'history' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
              <span className="font-semibold text-sm">History</span>
              <span className={`text-xs mt-1 ${activeTab === 'history' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-500'}`}>
                {animations.length} animation{animations.length !== 1 ? 's' : ''}
              </span>
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rotate-45" />
              )}
            </button>
          </div>
        </div>

        {/* Create Tab Content */}
        {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Photo → 3D Model */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Image className="h-5 w-5 text-blue-600" />
                </div>
                Photo → 3D Model Pipeline
              </CardTitle>
              <CardDescription>Upload a photo to generate a rigged 3D avatar</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload accept=".png,.jpg,.jpeg" maxSize={50} onFileSelect={handleImageToModel} />
              <div className="mt-4 flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>{' '}
                  <span className={`font-medium capitalize ${
                    imageJobStatus === 'completed' ? 'text-green-600' :
                    imageJobStatus === 'failed' ? 'text-red-600' :
                    imageJobStatus === 'running' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>{imageJobStatus}</span>
                  {imageJobId && <span className="ml-2 text-gray-500 text-xs">({imageJobId})</span>}
                </div>
              </div>
              {imageJobError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                  {imageJobError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Select Avatar for Lipsync */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                Select Avatar for Lipsync
              </CardTitle>
              <CardDescription>Choose an avatar to add audio and generate lipsync animations</CardDescription>
            </CardHeader>
            <CardContent>
              {avatars.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No avatars yet. Upload a photo above to create your first avatar.
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose Avatar
                  </label>
                  <select
                    value={selectedId || ''}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">-- Select an avatar --</option>
                    {avatars.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name || 'Untitled'} ({a.lipsync?.length || 0} animations)
                      </option>
                    ))}
                  </select>
                  
                  {selectedId && (
                    <div className="mt-3">
                      <Button 
                        onClick={() => {
                          const avatar = avatars.find(a => a.id === selectedId);
                          if (avatar) handleViewAvatar(avatar);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Open Avatar Details
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    How to Add Lipsync:
                  </h3>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>1. Select an avatar from the dropdown above</li>
                    <li>2. Click "Open Avatar Details" button</li>
                    <li>3. In the modal: Record audio or upload file</li>
                    <li>4. Click "Generate Lipsync"</li>
                    <li>5. Once complete, click "View Lipsync" to see animated 3D</li>
                  </ol>
                  <div className="mt-4">
                    <Button onClick={() => setActiveTab('avatars')} variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Or Browse All Avatars ({avatars.length})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* My Avatars Tab Content */}
        {activeTab === 'avatars' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  My Avatars
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                    {avatars.length} avatar{avatars.length !== 1 ? 's' : ''}
                  </span>
                  <Button onClick={refresh} variant="ghost" size="sm">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                All your created 3D avatars with lipsync animations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-gray-500">Loading avatars...</div>
              ) : avatars.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No avatars yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Go to Create tab to upload a photo or 3D model
                  </p>
                  <Button onClick={() => setActiveTab('create')} variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Create Avatar
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="group relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl transition-all duration-200 hover:shadow-lg"
                    >
                      {/* Avatar Preview */}
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-t-xl flex items-center justify-center">
                        <div className="text-center">
                          <Sparkles className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">3D Model</p>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="mb-3">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate mb-1">
                            {avatar.name || 'Untitled'}
                          </h4>
                          {avatar.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {avatar.description}
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                          Created {new Date(avatar.createdAt).toLocaleDateString()}
                        </div>

                        {avatar.lipsync && avatar.lipsync.length > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                            {avatar.lipsync.length} animation{avatar.lipsync.length !== 1 ? 's' : ''}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/30"
                            onClick={() => handleViewAvatar(avatar)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          
                          <Button
                            onClick={() => handleAvatarDeleted(avatar.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 px-3"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Animation History Tab Content */}
        {activeTab === 'history' && (
        <div>
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Video className="h-5 w-5 text-purple-600" />
                  </div>
                  Animation History
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                    {animations.length} animation{animations.length !== 1 ? 's' : ''}
                  </span>
                  <Button onClick={loadAnimationHistory} variant="ghost" size="sm">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Track all your avatar animations with lipsync and audio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {animationsLoading ? (
                <div className="py-8 text-center text-gray-500">Loading animations...</div>
              ) : animations.length === 0 ? (
                <div className="py-12 text-center">
                  <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No animations yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create avatars and add lipsync to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {animations.map((animation) => {
                    const isDeleting = deletingAnimationId === animation.id;
                    const statusColors = {
                      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    };
                    
                    return (
                      <div
                        key={animation.id}
                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Avatar Name */}
                            {animation.avatar && (
                              <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate mb-2">
                                {animation.avatar.name}
                              </h4>
                            )}

                            {/* Status & Duration */}
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[animation.status]}`}>
                                {animation.status}
                              </span>
                              {animation.duration_seconds && (
                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                  <Play className="h-3 w-3" />
                                  {animation.duration_seconds.toFixed(1)}s
                                </div>
                              )}
                            </div>

                            {/* Date */}
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {new Date(animation.created_at).toLocaleString()}
                            </div>

                            {/* URLs */}
                            <div className="space-y-1">
                              {animation.audio_url && (
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  <span className="font-medium">Audio:</span> {animation.audio_url.split('/').pop()}
                                </div>
                              )}
                              {animation.lipsync_url && (
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  <span className="font-medium">Lipsync:</span> {animation.lipsync_url.split('/').pop()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {animation.status === 'completed' && (
                              <Button
                                onClick={() => handlePlayAnimation(animation)}
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30"
                                disabled={isDeleting}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              onClick={() => handleDeleteAnimation(animation.id)}
                              variant="ghost"
                              size="sm"
                              disabled={isDeleting}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
        </div>
        )}
      </div>

      {/* Avatar View Modal */}
      {viewingAvatar && (
        <AvatarViewModal
          avatar={viewingAvatar}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          onDelete={handleAvatarDeleted}
          onUpdate={handleAvatarUpdated}
        />
      )}

      {/* Lipsync Playback Modal (for History Tab) */}
      {playbackConfig && (
        <LipSyncModal
          isOpen={lipSyncModalOpen}
          onClose={() => setLipSyncModalOpen(false)}
          modelUrl={playbackConfig.modelUrl}
          lipsyncUrl={playbackConfig.lipsyncUrl || ''}
          audioUrl={playbackConfig.audioUrl}
        />
      )}
    </PageContainer>
  );
};

export default AvatarServicePage;
