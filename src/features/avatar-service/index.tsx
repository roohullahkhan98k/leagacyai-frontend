import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Trash2, Play, Image, Sparkles, Video, Upload, Users, History, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import LipSyncModal from '../../components/ui/LipSyncModal';
import { listAvatars, deleteAvatar, startImageToModel, getPipelineJob, getAnimationHistory, deleteAnimation, absoluteAssetUrl, type AvatarRecord, type Animation } from '../../services/avatarApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import AvatarViewModal from '../../components/avatar/AvatarViewModal';
import { cn } from '../../utils/cn';

const AvatarServicePage = () => {
  const { t } = useTranslation();
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
  const [isVisible, setIsVisible] = useState(false);

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

  const refreshAll = async () => {
    await refresh();
    await loadAnimationHistory();
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
    setIsVisible(true);
    refresh();
    loadAnimationHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleDeleteAnimation = async (animationId: string) => {
    if (!confirm(t('avatar.deleteAnimation'))) return;
    
    setDeletingAnimationId(animationId);
    try {
      await deleteAnimation(animationId);
      setAnimations(prev => prev.filter(a => a.id !== animationId));
      toast.success(t('avatar.animationDeleted'));
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
    if (!confirm(t('avatar.deleteAvatarConfirm'))) return;
    
    try {
      await deleteAvatar(id);
      setAvatars(prev => prev.filter(a => a.id !== id));
      setViewModalOpen(false);
      setViewingAvatar(null);
      toast.success(t('avatar.avatarDeleted'));
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
      toast.error(t('avatar.modelUrlNotAvailable'));
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
            toast.success(t('avatar.avatarCreated'));
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
    <div className="w-full min-h-screen overflow-hidden">
      {/* Animated Background Gradient - Green Theme */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-[95rem] mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className={`mb-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link 
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('avatar.backToHome')}
          </Link>
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-20 animate-pulse" />
                <div className="relative p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {t('avatar.title')}
                  </span>
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                  {t('avatar.subtitle')}
                </p>
              </div>
            </div>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              {t('avatar.description')}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 shadow-lg max-w-4xl mx-auto">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-10">
          <div className="flex items-center justify-between gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            {/* Tabs on Left */}
            <div className="flex flex-wrap gap-3 flex-1">
              <button
                onClick={() => setActiveTab('create')}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50 transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 hover:scale-105'
                )}
              >
                <Upload className="h-5 w-5" />
                <span className="hidden sm:inline">{t('avatar.createAvatar')}</span>
              </button>

              <button
                onClick={() => setActiveTab('avatars')}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                  activeTab === 'avatars'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50 transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 hover:scale-105'
                )}
              >
                <Users className="h-5 w-5" />
                <span className="hidden sm:inline">{t('avatar.myAvatars')}</span>
                <span className="hidden sm:inline text-xs bg-white/20 dark:bg-white/10 px-2 py-0.5 rounded-full ml-1">
                  {avatars.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50 transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 hover:scale-105'
                )}
              >
                <History className="h-5 w-5" />
                <span className="hidden sm:inline">{t('avatar.history')}</span>
                <span className="hidden sm:inline text-xs bg-white/20 dark:bg-white/10 px-2 py-0.5 rounded-full ml-1">
                  {animations.length}
                </span>
              </button>
            </div>

            {/* Refresh Button on Right */}
            <button
              onClick={refreshAll}
              disabled={loading || animationsLoading}
              className={cn(
                'p-3 rounded-xl transition-all duration-300 flex-shrink-0',
                'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
                'border-2 border-green-200/50 dark:border-green-700/30',
                'hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30',
                'hover:border-green-300 dark:hover:border-green-600',
                'hover:scale-110 hover:shadow-lg hover:shadow-green-500/20',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'text-green-600 dark:text-green-400'
              )}
              title="Refresh all data"
            >
              <RefreshCcw className={cn('h-5 w-5', (loading || animationsLoading) && 'animate-spin')} />
            </button>
          </div>
          
          {/* Tab Description */}
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-700/30">
              <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {activeTab === 'create' && t('avatar.createDescription')}
                {activeTab === 'avatars' && t('avatar.avatarsDescription', { count: avatars.length })}
                {activeTab === 'history' && t('avatar.historyDescription', { count: animations.length })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width, No Centering */}
        {/* Create Tab Content */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Upload Section */}
              <div className="space-y-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <Image className="h-6 w-6 text-green-600" />
                      </div>
                      {t('avatar.create3DAvatar')}
                    </CardTitle>
                    <CardDescription className="mt-2">{t('avatar.uploadPhoto')}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FileUpload accept=".png,.jpg,.jpeg" maxSize={50} onFileSelect={handleImageToModel} />
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('avatar.status')}:</span>
                        <span className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${
                          imageJobStatus === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          imageJobStatus === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          imageJobStatus === 'running' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {imageJobStatus}
                        </span>
                      </div>
                      {imageJobId && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {t('avatar.jobId')}: {imageJobId}
                        </div>
                      )}
                    </div>
                    {imageJobError && (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                        {imageJobError}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Select Avatar & Info */}
              <div className="space-y-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                        <Video className="h-6 w-6 text-teal-600" />
                      </div>
                      {t('avatar.addLipsync')}
                    </CardTitle>
                    <CardDescription className="mt-2">{t('avatar.chooseAvatar')}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {avatars.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          No avatars yet. Upload a photo to create your first avatar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('avatar.selectAvatar')}
                        </label>
                        <select
                          value={selectedId || ''}
                          onChange={(e) => setSelectedId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        >
                          <option value="">{t('avatar.chooseAvatarOption')}</option>
                          {avatars.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name || 'Untitled'} ({a.lipsync?.length || 0} animations)
                            </option>
                          ))}
                        </select>
                        
                        {selectedId && (
                          <Button 
                            onClick={() => {
                              const avatar = avatars.find(a => a.id === selectedId);
                              if (avatar) handleViewAvatar(avatar);
                            }}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50 transition-all duration-300 hover:scale-105 py-3"
                          >
                            <Play className="h-5 w-5 mr-2" />
                            {t('avatar.openAvatarDetails')}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex-shrink-0">
                        <Sparkles className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">
                          {t('avatar.quickGuide')}
                        </h3>
                        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-green-600">1.</span>
                            <span>{t('avatar.guideStep1')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-green-600">2.</span>
                            <span>{t('avatar.guideStep2')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-green-600">3.</span>
                            <span>{t('avatar.guideStep3')}</span>
                          </li>
                        </ol>
                        <div className="mt-6">
                          <Button 
                            onClick={() => setActiveTab('avatars')} 
                            variant="outline" 
                            className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-700/30 hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            {t('avatar.browseAllAvatars')} ({avatars.length})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* My Avatars Tab Content */}
          {activeTab === 'avatars' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('avatar.myAvatars')}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('avatar.avatarsTotal', { count: avatars.length })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('create')} 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('avatar.createNew')}
                  </Button>
                </div>
              </div>

              {/* Avatars Grid */}
              {loading ? (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">{t('avatar.loadingAvatars')}</p>
                </div>
              ) : avatars.length === 0 ? (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-16 text-center">
                  <Users className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {t('avatar.noAvatarsYet')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {t('avatar.getStartedDescription')}
                  </p>
                  <Button 
                    onClick={() => setActiveTab('create')} 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50 transition-all duration-300 hover:scale-105 px-8 py-3"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    {t('avatar.createFirstAvatar')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="group bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-green-300 dark:hover:border-green-700"
                    >
                      {/* Avatar Preview */}
                      <div className="h-64 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/40 dark:via-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
                        <div className="relative text-center z-10">
                          <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-full inline-block mb-3 shadow-lg">
                            <Sparkles className="h-10 w-10 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">3D Avatar Model</p>
                        </div>
                      </div>

                      {/* Avatar Info */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate mb-2">
                            {avatar.name || 'Untitled Avatar'}
                          </h4>
                          {avatar.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                              {avatar.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span>{new Date(avatar.createdAt).toLocaleDateString()}</span>
                          {avatar.lipsync && avatar.lipsync.length > 0 && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                              {avatar.lipsync.length} animation{avatar.lipsync.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleViewAvatar(avatar)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50 transition-all duration-300 hover:scale-105"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {t('avatar.view')}
                          </Button>
                          
                          <Button
                            onClick={() => handleAvatarDeleted(avatar.id)}
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 px-4 transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Animation History Tab Content */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                      <Video className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('avatar.animationHistory')}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('avatar.animationsTotal', { count: animations.length })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animations List */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                {animationsLoading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
                  </div>
                ) : animations.length === 0 ? (
                  <div className="py-16 text-center">
                    <Video className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {t('avatar.noAnimationsYet')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                      {t('avatar.createAnimationsDescription')}
                    </p>
                    <Button 
                      onClick={() => setActiveTab('create')} 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50 transition-all duration-300 hover:scale-105 px-8 py-3"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      {t('avatar.createAvatar')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                          className="p-6 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/50 dark:border-teal-800/50 rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1 min-w-0 space-y-3">
                              {/* Avatar Name */}
                              {animation.avatar && (
                                <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 truncate">
                                  {animation.avatar.name}
                                </h4>
                              )}

                              {/* Status & Duration */}
                              <div className="flex items-center gap-4 flex-wrap">
                                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${statusColors[animation.status]}`}>
                                  {animation.status}
                                </span>
                                {animation.duration_seconds && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Play className="h-4 w-4" />
                                    <span className="font-medium">{animation.duration_seconds.toFixed(1)}s</span>
                                  </div>
                                )}
                                <div className="text-sm text-gray-500 dark:text-gray-500">
                                  {new Date(animation.created_at).toLocaleString()}
                                </div>
                              </div>

                              {/* URLs */}
                              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                {animation.audio_url && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Audio:</span>{' '}
                                    <span className="font-mono text-xs">{animation.audio_url.split('/').pop()}</span>
                                  </div>
                                )}
                                {animation.lipsync_url && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Lipsync:</span>{' '}
                                    <span className="font-mono text-xs">{animation.lipsync_url.split('/').pop()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 flex-shrink-0">
                              {animation.status === 'completed' && (
                                <Button
                                  onClick={() => handlePlayAnimation(animation)}
                                  variant="outline"
                                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/50 transition-all duration-300 hover:scale-105"
                                  disabled={isDeleting}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  {t('avatar.play')}
                                </Button>
                              )}
                              
                              <Button
                                onClick={() => handleDeleteAnimation(animation.id)}
                                variant="ghost"
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-300 px-4"
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
              </div>
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
    </div>
  );
};

export default AvatarServicePage;
