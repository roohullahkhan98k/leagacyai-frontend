import { useState, useCallback, useEffect } from 'react';
import { 
  Image, ArrowLeft, Upload, Grid3X3, 
  Home, Link2, Brain, Sparkles, TrendingUp, Clock, 
  BarChart3, AlertCircle, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

import PageContainer from '../../components/layout/PageContainer';
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
    toast.success(`${files.length} files uploaded successfully`, { position: 'top-right', autoClose: 3000 });
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
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Home, description: 'Overview & Insights' },
    { id: 'upload' as TabType, label: 'Upload', icon: Upload, description: 'Add New Media' },
    { id: 'gallery' as TabType, label: 'Gallery', icon: Grid3X3, description: 'Browse Media' },
    { id: 'nodes' as TabType, label: 'Memories', icon: Brain, description: 'Memory Nodes' },
    { id: 'linking' as TabType, label: 'Linking', icon: Link2, description: 'Connect Media' },
    { id: 'links' as TabType, label: 'Links', icon: Link2, description: 'View All Links' },
    { id: 'insights' as TabType, label: 'Insights', icon: BarChart3, description: 'Analytics' },
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-primary-100 dark:border-primary-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Multimedia Management
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Organize your media files and create meaningful connections with memory nodes
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4" />
                <span>Auto-tagging & Metadata</span>
              </div>
              <div className="flex items-center space-x-1">
                <Link2 className="h-4 w-4" />
                <span>Smart Linking</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4" />
                <span>Memory Organization</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <Image className="h-16 w-16 text-primary-600" />
            </div>
          </div>
            </div>
          </div>
          
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Media</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMedia}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Nodes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalNodes}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Linked Media</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.linkedMedia}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Link2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unlinked Media</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.unlinkedMedia}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900 dark:text-white">Upload Media Files</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
            </button>
            
            <button
              onClick={() => setActiveTab('nodes')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">Create Memory Node</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
            </button>
            
            <button
              onClick={() => setActiveTab('linking')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Link2 className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">Link Media to Memories</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
            </button>
            
            <button
              onClick={() => setActiveTab('links')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Link2 className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-gray-900 dark:text-white">View All Links</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
            </button>
            
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <Clock className="h-4 w-4 text-primary-600" />
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
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
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
                <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <Upload className="h-12 w-12 text-primary-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Upload Media Files
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Upload images and videos with automatic metadata extraction
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
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Grid3X3 className="h-12 w-12 text-blue-600" />
                </div>
            </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Media Gallery
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Browse and manage your uploaded media files
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
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Brain className="h-12 w-12 text-green-600" />
              </div>
            </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Memory Nodes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage memory nodes to organize your media
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
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Link2 className="h-12 w-12 text-purple-600" />
              </div>
            </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Link Media to Memories
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Connect your media files to memory nodes to create rich relationships
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
                      { action: 'Media linked to memory node', time: 'Just now' },
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
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <Link2 className="h-12 w-12 text-indigo-600" />
              </div>
            </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                All Links Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all connections between your media and memory nodes
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
                <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <BarChart3 className="h-12 w-12 text-primary-600" />
            </div>
          </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics & Insights
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Discover patterns and insights in your media collection
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
    <PageContainer>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Multimedia Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Organize your media files and create meaningful connections with memory nodes
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </PageContainer>
  );
};

export default MultimediaPage;