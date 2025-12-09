import { useState, useCallback, useEffect } from 'react';
import { 
  Image, ArrowLeft, Upload, Grid3X3, 
  Home, Link2, Brain, Sparkles, TrendingUp, Clock, 
  BarChart3, AlertCircle, Zap, RefreshCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import MediaUploader from '../../components/multimedia/MediaUploader';
import MediaGallery from '../../components/multimedia/MediaGallery';
import MemoryNodeManager from '../../components/multimedia/MemoryNodeManager';
import MediaLinker from '../../components/multimedia/MediaLinker';
import LinksOverview from '../../components/multimedia/LinksOverview';
import AnalyticsInsights from '../../components/multimedia/AnalyticsInsights';
import { MediaFile, MemoryNode, getAllMedia, getAllNodes, getDashboardAnalytics, getLinksManagement } from '../../services/multimediaApi';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';

type TabType = 'dashboard' | 'upload' | 'gallery' | 'nodes' | 'linking' | 'links' | 'insights';

const MultimediaPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalNodes: 0,
    linkedMedia: 0,
    unlinkedMedia: 0,
    recentActivity: [] as Array<{ action: string; time: string }>
  });


  // Load initial stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get all data in parallel
        const [analyticsResult, mediaResult, nodesResult, linksResult] = await Promise.all([
          getDashboardAnalytics().catch(() => ({ data: null })),
          getAllMedia(),
          getAllNodes(),
          getLinksManagement({ limit: 1000 }).catch(() => ({ data: { links: [] } }))
        ]);
        
        const totalMedia = mediaResult.data.media?.length || 0;
        const totalNodes = nodesResult.data.nodes?.length || 0;
        
        // Calculate actual linked/unlinked counts from links data
        const linkedMediaIds = new Set(linksResult.data.links?.map(link => link.media.id) || []);
        const linkedMedia = linkedMediaIds.size;
        const unlinkedMedia = totalMedia - linkedMedia;
        
        setStats(prev => ({
          ...prev,
          totalMedia,
          totalNodes,
          linkedMedia,
          unlinkedMedia,
          recentActivity: analyticsResult.data?.recentActivity ? 
            analyticsResult.data.recentActivity.map(activity => ({
              action: activity.type,
              time: activity.timestamp
            })) : []
        }));
      } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to basic stats
        try {
          const [mediaResult, nodesResult] = await Promise.all([
            getAllMedia(),
            getAllNodes()
          ]);
          
          const totalMedia = mediaResult.data.media?.length || 0;
          const totalNodes = nodesResult.data.nodes?.length || 0;
          
          setStats(prev => ({
            ...prev,
            totalMedia,
            totalNodes,
            linkedMedia: 0,
            unlinkedMedia: totalMedia
          }));
        } catch (fallbackError) {
          console.error('Error loading fallback stats:', fallbackError);
        }
      }
    };

    loadStats();
  }, []);

  const handleDataRefresh = useCallback(async () => {
    try {
      // Get all data in parallel
      const [analyticsResult, mediaResult, nodesResult, linksResult] = await Promise.all([
        getDashboardAnalytics().catch(() => ({ data: null })),
        getAllMedia(),
        getAllNodes(),
        getLinksManagement({ limit: 1000 }).catch(() => ({ data: { links: [] } }))
      ]);
      
      const totalMedia = mediaResult.data.media?.length || 0;
      const totalNodes = nodesResult.data.nodes?.length || 0;
      
      // Calculate actual linked/unlinked counts from links data
      const linkedMediaIds = new Set(linksResult.data.links?.map(link => link.media.id) || []);
      const linkedMedia = linkedMediaIds.size;
      const unlinkedMedia = totalMedia - linkedMedia;
      
      setStats(prev => ({
        ...prev,
        totalMedia,
        totalNodes,
        linkedMedia,
        unlinkedMedia,
        recentActivity: analyticsResult.data?.recentActivity ? 
          analyticsResult.data.recentActivity.map(activity => ({
            action: activity.type,
            time: activity.timestamp
          })) : []
      }));
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, []);

  const refreshAll = async () => {
    await handleDataRefresh();
  };

  const handleUploadComplete = useCallback(async (files: MediaFile[]) => {
    // Refresh stats after upload
    try {
      const [mediaResult, nodesResult, linksResult] = await Promise.all([
        getAllMedia(),
        getAllNodes(),
        getLinksManagement({ limit: 1000 }).catch(() => ({ data: { links: [] } }))
      ]);
      
      const totalMedia = mediaResult.data.media?.length || 0;
      const totalNodes = nodesResult.data.nodes?.length || 0;
      
      // Calculate actual linked/unlinked counts from links data
      const linkedMediaIds = new Set(linksResult.data.links?.map(link => link.media.id) || []);
      const linkedMedia = linkedMediaIds.size;
      const unlinkedMedia = totalMedia - linkedMedia;
      
      setStats(prev => ({
        ...prev,
        totalMedia,
        totalNodes,
        linkedMedia,
        unlinkedMedia,
        recentActivity: [
          { action: `${files.length} files uploaded`, time: 'Just now' },
          ...prev.recentActivity.slice(0, 4)
        ]
      }));
    } catch (error) {
      console.error('Error refreshing stats after upload:', error);
      // Fallback to manual update
      setStats(prev => ({
        ...prev,
        totalMedia: prev.totalMedia + files.length,
        unlinkedMedia: prev.unlinkedMedia + files.length,
        recentActivity: [
          { action: `${files.length} files uploaded`, time: 'Just now' },
          ...prev.recentActivity.slice(0, 4)
        ]
      }));
    }
    setActiveTab('gallery');
    toast.success(t('multimedia.filesUploaded', { count: files.length }), { position: 'top-right', autoClose: 3000 });
  }, []);

  const handleUploadError = useCallback((error: string) => {
    console.error('Upload error:', error);
  }, []);

  const handleMediaSelect = useCallback((media: MediaFile) => {
    setSelectedMedia(media);
    setActiveTab('linking');
  }, []);

  const handleNodeSelect = useCallback((node: MemoryNode) => {
    setSelectedNode(node);
    setActiveTab('linking');
  }, []);

  const tabs = [
    { id: 'dashboard' as TabType, label: t('multimedia.dashboard'), icon: Home, description: t('multimedia.dashboardDescription') },
    { id: 'upload' as TabType, label: t('multimedia.upload'), icon: Upload, description: t('multimedia.uploadDescription') },
    { id: 'gallery' as TabType, label: t('multimedia.gallery'), icon: Grid3X3, description: t('multimedia.galleryDescription') },
    { id: 'nodes' as TabType, label: t('multimedia.memories'), icon: Brain, description: t('multimedia.nodesDescription') },
    { id: 'linking' as TabType, label: t('multimedia.linking'), icon: Link2, description: t('multimedia.linkingDescription') },
    { id: 'links' as TabType, label: t('multimedia.links'), icon: Link2, description: t('multimedia.linksDescription') },
    { id: 'insights' as TabType, label: t('multimedia.insights'), icon: BarChart3, description: t('multimedia.insightsDescription') },
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('multimedia.dashboardOverview')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {t('multimedia.organizeDescription')}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t('multimedia.autoTagging')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Link2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span>{t('multimedia.smartLinking')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>{t('multimedia.memoryOrganization')}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <Image className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>
          
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('multimedia.totalMedia')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMedia}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-full">
              <Image className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('multimedia.memoryNodes')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalNodes}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full">
              <Brain className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('multimedia.linkedMedia')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.linkedMedia}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
              <Link2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('multimedia.unlinkedMedia')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.unlinkedMedia}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
              <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              {t('multimedia.quickActions')}
            </h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-lg hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-900/30 dark:hover:to-violet-900/30 transition-all duration-300 border border-indigo-200/50 dark:border-indigo-700/30 hover:border-indigo-300 dark:hover:border-indigo-600"
            >
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-gray-900 dark:text-white">{t('multimedia.uploadMediaFiles')}</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-indigo-400 rotate-180" />
            </button>
            
            <button
              onClick={() => setActiveTab('nodes')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-lg hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-900/30 dark:hover:to-purple-900/30 transition-all duration-300 border border-violet-200/50 dark:border-violet-700/30 hover:border-violet-300 dark:hover:border-violet-600"
            >
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span className="font-medium text-gray-900 dark:text-white">{t('multimedia.createMemoryNode')}</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-violet-400 rotate-180" />
            </button>
            
            <button
              onClick={() => setActiveTab('linking')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300 border border-purple-200/50 dark:border-purple-700/30 hover:border-purple-300 dark:hover:border-purple-600"
            >
              <div className="flex items-center space-x-3">
                <Link2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-gray-900 dark:text-white">{t('multimedia.linkMediaToMemories')}</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-purple-400 rotate-180" />
            </button>
            
            <button
              onClick={() => setActiveTab('links')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-lg hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-900/30 dark:hover:to-violet-900/30 transition-all duration-300 border border-indigo-200/50 dark:border-indigo-700/30 hover:border-indigo-300 dark:hover:border-indigo-600"
            >
              <div className="flex items-center space-x-3">
                <Link2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-gray-900 dark:text-white">{t('multimedia.viewAllLinks')}</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-indigo-400 rotate-180" />
            </button>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-violet-600 dark:text-violet-400" />
              {t('multimedia.recentActivity')}
            </h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/10 dark:to-violet-950/10 rounded-lg border border-indigo-200/30 dark:border-indigo-700/20">
                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-lg">
                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">{t('multimedia.noRecentActivity')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();

      case 'upload':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full blur opacity-20 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-full">
                    <Upload className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('multimedia.uploadMediaFilesTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('multimedia.uploadDescriptionText')}
              </p>
            </div>
            <MediaUploader
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur opacity-20 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full">
                    <Grid3X3 className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('multimedia.mediaGallery')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('multimedia.browseDescription')}
              </p>
            </div>
            <MediaGallery 
              onMediaSelect={handleMediaSelect} 
              selectedNode={selectedNode}
              onDataRefresh={handleDataRefresh}
            />
          </div>
        );

      case 'nodes':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-20 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
                    <Brain className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('multimedia.memoryNodesTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('multimedia.nodesDescriptionText')}
              </p>
            </div>
            <MemoryNodeManager onNodeSelect={handleNodeSelect} />
          </div>
        );

      case 'linking':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full blur opacity-20 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-full">
                    <Link2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('multimedia.linkMediaTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('multimedia.linkDescriptionText')}
              </p>
            </div>
            <MediaLinker
              selectedNode={selectedNode}
              selectedMedia={selectedMedia}
              onLinkChange={async () => {
                // Refresh stats when links change
                try {
                  const [mediaResult, nodesResult, linksResult] = await Promise.all([
                    getAllMedia(),
                    getAllNodes(),
                    getLinksManagement({ limit: 1000 }).catch(() => ({ data: { links: [] } }))
                  ]);
                  
                  const totalMedia = mediaResult.data.media?.length || 0;
                  const totalNodes = nodesResult.data.nodes?.length || 0;
                  
                  // Calculate actual linked/unlinked counts from links data
                  const linkedMediaIds = new Set(linksResult.data.links?.map(link => link.media.id) || []);
                  const linkedMedia = linkedMediaIds.size;
                  const unlinkedMedia = totalMedia - linkedMedia;
                  
                  setStats(prev => ({
                    ...prev,
                    totalMedia,
                    totalNodes,
                    linkedMedia,
                    unlinkedMedia,
                    recentActivity: [
                      { action: t('multimedia.mediaLinked'), time: 'Just now' },
                      ...prev.recentActivity.slice(0, 4)
                    ]
                  }));
                } catch (error) {
                  console.error('Error refreshing stats after link change:', error);
                }
              }}
            />
          </div>
        );

      case 'links':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur opacity-20 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-full">
                    <Link2 className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('multimedia.allLinksOverview')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('multimedia.linksDescriptionText')}
              </p>
            </div>
            <LinksOverview onDataRefresh={handleDataRefresh} />
          </div>
        );


      case 'insights':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-full blur opacity-20 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-r from-indigo-100 via-violet-100 to-purple-100 dark:from-indigo-900/30 dark:via-violet-900/30 dark:to-purple-900/30 rounded-full">
                    <BarChart3 className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('multimedia.analyticsInsights')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('multimedia.analyticsDescription')}
              </p>
            </div>
            
            {/* Real Analytics Data */}
            <AnalyticsInsights />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen overflow-hidden">
      {/* Animated Background Gradient - Indigo/Violet Theme */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-[95rem] mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="mb-10">
          <Link 
            to="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('multimedia.backToHome')}
          </Link>
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl blur opacity-20 animate-pulse" />
                <div className="relative p-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl shadow-lg">
                  <Image className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {t('multimedia.title')}
                  </span>
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                  {t('multimedia.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-10">
          <div className="flex items-center justify-between gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            {/* Tabs on Left */}
            <div className="flex flex-wrap gap-3 flex-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/50 transform scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 dark:hover:from-indigo-950/20 dark:hover:to-violet-950/20 hover:scale-105'
                    )}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Refresh Button on Right */}
            <button
              onClick={refreshAll}
              className={cn(
                'p-3 rounded-xl transition-all duration-300 flex-shrink-0',
                'bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20',
                'border-2 border-indigo-200/50 dark:border-indigo-700/30',
                'hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-900/30 dark:hover:to-violet-900/30',
                'hover:border-indigo-300 dark:hover:border-indigo-600',
                'hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20',
                'text-indigo-600 dark:text-indigo-400'
              )}
              title="Refresh all data"
            >
              <RefreshCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MultimediaPage;