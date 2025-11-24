import React, { useState, useEffect } from 'react';
import { 
  Image, Video, BarChart3, TrendingUp, Clock, Users, 
  Calendar, MapPin, Camera, Smartphone, Monitor, 
  CheckCircle, AlertCircle, Network, Link2, Star
} from 'lucide-react';
import { getDashboardAnalytics, getAllMedia, getAllNodes, getLinksManagement } from '../../services/multimediaApi';
import Card from '../ui/Card';
import { toast } from 'react-toastify';

const AnalyticsInsights: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        
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
        
        // Calculate media type distribution
        const images = mediaResult.data.media?.filter(m => m.type === 'image').length || 0;
        const videos = mediaResult.data.media?.filter(m => m.type === 'video').length || 0;
        
        // Calculate node type distribution
        const events = nodesResult.data.nodes?.filter(n => n.type === 'event').length || 0;
        const people = nodesResult.data.nodes?.filter(n => n.type === 'person').length || 0;
        const timeline = nodesResult.data.nodes?.filter(n => n.type === 'timeline').length || 0;
        
        // Calculate nodes with media
        const nodesWithMedia = new Set(linksResult.data.links?.map(link => link.node.id) || []).size;
        
        // Create analytics data with correct calculations
        const analyticsData = {
          overview: {
            totalMedia,
            totalNodes,
            totalLinks: linksResult.data.links?.length || 0,
            storageUsed: analyticsResult.data?.overview?.storageUsed || '0 MB',
            lastActivity: analyticsResult.data?.overview?.lastActivity || new Date().toISOString()
          },
          mediaStats: {
            images,
            videos,
            linkedMedia,
            unlinkedMedia
          },
          nodeStats: {
            events,
            people,
            timeline,
            nodesWithMedia,
            emptyNodes: totalNodes - nodesWithMedia
          },
          recentActivity: analyticsResult.data?.recentActivity || [],
          topNodes: analyticsResult.data?.topNodes || []
        };
        
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast.error('Could not load analytics data', { position: 'top-right', autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Analytics data is not available at the moment.
        </p>
      </div>
    );
  }

  const { overview, mediaStats, nodeStats, recentActivity, topNodes } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Media</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.totalMedia}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Image className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Nodes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.totalNodes}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Network className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Links</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.totalLinks}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Link2 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.storageUsed}</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Media Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Image className="h-5 w-5 mr-2 text-blue-600" />
            Media Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Image className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Images</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {mediaStats.images}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({overview.totalMedia > 0 ? Math.round((mediaStats.images / overview.totalMedia) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Video className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Videos</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {mediaStats.videos}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({overview.totalMedia > 0 ? Math.round((mediaStats.videos / overview.totalMedia) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Linked Media</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {mediaStats.linkedMedia}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({overview.totalMedia > 0 ? Math.round((mediaStats.linkedMedia / overview.totalMedia) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Unlinked Media</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {mediaStats.unlinkedMedia}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({overview.totalMedia > 0 ? Math.round((mediaStats.unlinkedMedia / overview.totalMedia) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Network className="h-5 w-5 mr-2 text-green-600" />
            Memory Organization
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Events</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {nodeStats.events}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">People</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {nodeStats.people}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Timeline</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {nodeStats.timeline}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Nodes with Media</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {nodeStats.nodesWithMedia}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((activity: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Clock className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.type === 'media_uploaded' && `${activity.filename} uploaded`}
                    {activity.type === 'media_linked' && `Media linked to "${activity.nodeTitle}"`}
                    {activity.type === 'node_created' && `Memory node "${activity.nodeTitle}" created`}
                    {!['media_uploaded', 'media_linked', 'node_created'].includes(activity.type) && activity.type}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
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

      {/* Top Memory Nodes */}
      {topNodes && topNodes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-600" />
            Top Memory Nodes
          </h3>
          <div className="space-y-3">
            {topNodes.slice(0, 5).map((node: any, index: number) => (
              <div key={node.nodeId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{node.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {node.mediaCount} media files • {node.views} views
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsInsights;
