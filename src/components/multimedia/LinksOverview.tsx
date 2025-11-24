import React, { useState, useEffect, useCallback } from 'react';
import { 
  Link2, Search, 
  Calendar, Users, FileText, Star, Bookmark, 
  Loader2, Network, FileVideo, Clock, Unlink, ArrowRight, Eye, X,
  Music, Smartphone, MapPin
} from 'lucide-react';
import { 
  getLinksManagement, 
  unlinkMediaFromNode, 
  getNode,
  getMediaForNode,
  formatDate,
  MediaFile,
  MemoryNode
} from '../../services/multimediaApi';

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
import { toast } from 'react-toastify';

// Helper to get backend URL from environment
const getBackendUrl = (): string => {
  const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
  return rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';
};

interface LinkData {
  media: {
    id: string;
    filename: string;
    originalName: string;
    path: string;
    type: 'image' | 'video' | 'audio';
    mimeType: string;
    metadata: {
      fileSize?: number;
      width?: number;
      height?: number;
      dateTaken?: string;
      device?: string;
      location?: string;
      gps?: {
        latitude: number;
        longitude: number;
        altitude?: number;
      };
      cameraSettings?: {
        make?: string;
        model?: string;
        fNumber?: number;
        exposureTime?: string;
        iso?: number;
        focalLength?: string;
        lens?: string;
        flash?: string;
      };
      videoMetadata?: {
        duration?: number;
        resolution?: string;
        codec?: string;
        bitrate?: number;
        fps?: string;
        audioCodec?: string;
        audioChannels?: number;
        audioBitrate?: number;
        title?: string;
        artist?: string;
        album?: string;
        year?: string;
      };
      audioMetadata?: {
        duration?: number;
        bitrate?: number;
        sampleRate?: number;
        channels?: number;
        codec?: string;
        title?: string;
        artist?: string;
        album?: string;
        year?: string;
        genre?: string;
        track?: string;
        disc?: string;
      };
      tags?: string[];
    };
    createdAt: string;
    updatedAt: string;
  };
  node: {
    id: string;
    title: string;
    description: string;
    type: 'event' | 'person' | 'timeline';
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
  relationship: 'primary' | 'associated' | 'reference';
  linkId: string;
  createdAt: string;
}

interface LinksOverviewProps {
  onDataRefresh?: () => void;
  className?: string;
}

type FilterType = 'all' | 'primary' | 'associated' | 'reference';
type SortBy = 'createdAt' | 'relationship' | 'mediaType';

const LinksOverview: React.FC<LinksOverviewProps> = ({ onDataRefresh, className = '' }) => {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');

  // Toast hooks

  const loadLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get links management data
            const linksResult = await getLinksManagement({
              view: 'list',
              filter: filterType === 'all' ? undefined : filterType,
              sortBy: sortBy,
              order: 'desc',
              page: 1,
              limit: 100 // Load more links for overview
            });


      const allLinks: LinkData[] = (linksResult.data.links || []).map(link => ({
        media: {
          id: link.media.id,
          filename: link.media.filename,
          originalName: link.media.originalName || link.media.filename,
          path: link.media.path || '',
          type: link.media.type,
          mimeType: link.media.mimeType || (link.media.type === 'image' ? 'image/jpeg' : 'video/mp4'),
          metadata: link.media.metadata || {
            fileSize: 0,
            tags: []
          },
          createdAt: link.media.createdAt || link.createdAt,
          updatedAt: link.media.updatedAt || link.createdAt
        },
        node: {
          id: link.node.id,
          title: link.node.title,
          description: link.node.description || '',
          type: link.node.type,
          metadata: link.node.metadata || {},
          createdAt: link.createdAt,
          updatedAt: link.createdAt
        },
        relationship: link.relationship,
        linkId: link.linkId,
        createdAt: link.createdAt
      }));

      setLinks(allLinks);
    } catch (err) {
      console.error('Error loading links:', err);
      setLinks([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [filterType, sortBy]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleUnlink = useCallback(async (mediaId: string, nodeId: string) => {
    try {
      await unlinkMediaFromNode(mediaId, nodeId);
      setLinks(prev => prev.filter(link => !(link.media.id === mediaId && link.node.id === nodeId)));
      toast.success('Media unlinked from memory node successfully', { position: 'top-right', autoClose: 3000 });
      onDataRefresh?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlink media';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
    }
  }, [onDataRefresh]);



  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'person': return <Users className="h-4 w-4 text-green-600" />;
      case 'timeline': return <Clock className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredLinks = links.filter(link => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!link.media.originalName.toLowerCase().includes(query) &&
          !link.node.title.toLowerCase().includes(query) &&
          !link.node.description.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Relationship filter
    if (filterType !== 'all' && link.relationship !== filterType) {
      return false;
    }

    return true;
  });

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    switch (sortBy) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'mediaType':
        return a.media.type.localeCompare(b.media.type);
      case 'relationship':
        return a.relationship.localeCompare(b.relationship);
      default:
        return 0;
    }
  });


  const LinkCard: React.FC<{ nodeId: string; links: LinkData[] }> = ({ links }) => {
    const node = links[0].node;
    const [showModal, setShowModal] = useState(false);
    const [fullNodeData, setFullNodeData] = useState<MemoryNode | null>(null);
    const [fullMediaData, setFullMediaData] = useState<MediaFile[]>([]);
    const [loadingModal, setLoadingModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'media'>('details');


    const handleOpenModal = async () => {
      setLoadingModal(true);
      setActiveTab('details'); // Reset to details tab when opening
      try {
        // Fetch full node data
        const nodeResult = await getNode(node.id);
        setFullNodeData(nodeResult.data);
        
        // Fetch full media data for this node
        const mediaResult = await getMediaForNode(node.id);
        setFullMediaData(mediaResult.data.media || []);
        
        setShowModal(true);
      } catch (error) {
        console.error('Error fetching node data:', error);
        // Fallback to existing data
        setFullNodeData(node as MemoryNode);
        setFullMediaData(links.map(link => ({
          ...link.media,
          metadata: {
            ...link.media.metadata,
            fileSize: link.media.metadata?.fileSize || 0,
            tags: link.media.metadata?.tags || []
          }
        })));
        setShowModal(true);
      } finally {
        setLoadingModal(false);
      }
    };
    
    return (
      <>
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow mb-3 relative">
          {/* Actions - Top Right for screens < 850px */}
          <div className="absolute top-4 right-4 lg:hidden">
            <div className="flex items-center space-x-1">
              <button
                onClick={handleOpenModal}
                disabled={loadingModal}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                title="View Details"
              >
                {loadingModal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => {
                  links.forEach(link => handleUnlink(link.media.id, link.node.id));
                }}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Unlink All"
              >
                <Unlink className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Original horizontal layout */}
          <div className="flex items-center space-x-4">
            {/* Media Images */}
            <div className="flex items-center space-x-2">
              {links.slice(0, 3).map((link, index) => (
                <div key={link.linkId} className="relative">
                  <div 
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowModal(true)}
                  >
                    {link.media.type === 'image' ? (
                      <img
                        src={`${getBackendUrl()}/api/multimedia/media/${link.media.id}/download`}
                        alt="Media"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileVideo className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {index === 2 && links.length > 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+{links.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${
                links[0].relationship === 'primary' 
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : links[0].relationship === 'associated'
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                <ArrowRight className={`h-4 w-4 ${
                  links[0].relationship === 'primary' 
                    ? 'text-green-600 dark:text-green-400'
                    : links[0].relationship === 'associated'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`} />
              </div>
              <span className={`text-xs font-medium mt-1 ${
                links[0].relationship === 'primary' 
                  ? 'text-green-600 dark:text-green-400'
                  : links[0].relationship === 'associated'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {links[0].relationship.toUpperCase()}
              </span>
            </div>

            {/* Memory Node */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  node.type === 'event' 
                    ? 'bg-blue-500'
                    : node.type === 'person'
                    ? 'bg-green-500'
                    : 'bg-purple-500'
                }`}>
                  {getNodeIcon(node.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    {node.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {node.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {node.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {links.length} media
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(links[0].createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - Original position for screens >= 850px */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={handleOpenModal}
                disabled={loadingModal}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingModal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span>{loadingModal ? 'Loading...' : 'View'}</span>
              </button>
              <button
                onClick={() => {
                  links.forEach(link => handleUnlink(link.media.id, link.node.id));
                }}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Unlink className="h-4 w-4" />
                <span>Unlink All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    (fullNodeData || node).type === 'event' 
                      ? 'bg-blue-500'
                      : (fullNodeData || node).type === 'person'
                      ? 'bg-green-500'
                      : 'bg-purple-500'
                  }`}>
                    {getNodeIcon((fullNodeData || node).type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {(fullNodeData || node).title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(fullNodeData || node).type.toUpperCase()} • {fullMediaData.length || links.length} linked media
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Mobile Tabs - Only show on mobile */}
              <div className="lg:hidden border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'details'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'media'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Media ({fullMediaData.length || links.length})
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)] lg:h-[calc(90vh-120px)]">
                {/* Memory Node Details */}
                <div className={`w-full lg:w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto ${
                  activeTab === 'details' ? 'block' : 'hidden lg:block'
                }`}>
                  <div className="p-6 space-y-6">
                    {/* Node Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Memory Node Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Title</label>
                          <p className="text-gray-900 dark:text-white">{node.title}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                          <p className="text-gray-900 dark:text-white">{(fullNodeData || node).description || 'No description'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            node.type === 'event' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : node.type === 'person'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {node.type.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                          <p className="text-gray-900 dark:text-white">{formatDate((fullNodeData || node).createdAt || '')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                          <p className="text-gray-900 dark:text-white">{formatDate((fullNodeData || node).updatedAt || '')}</p>
                        </div>
                        
                        {/* Location */}
                        {((fullNodeData || node).metadata?.location) ? (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
                            <p className="text-gray-900 dark:text-white flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span>{String((fullNodeData || node).metadata?.location || '')}</span>
                            </p>
                          </div>
                        ) : null}

                        {/* Participants */}
                        {((fullNodeData || node).metadata?.participants && Array.isArray((fullNodeData || node).metadata?.participants)) ? (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Participants</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(Array.isArray((fullNodeData || node).metadata?.participants) ? (fullNodeData || node).metadata?.participants as string[] : []).map((participant: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                >
                                  <Users className="h-3 w-3 mr-1" />
                                  {String(participant)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Node Metadata */}
                    {node.metadata && Object.keys(node.metadata).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Additional Information
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(node.metadata).map(([key, value]) => (
                            <div key={key}>
                              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </label>
                              <p className="text-gray-900 dark:text-white">
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Link Statistics */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Link Statistics
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Links:</span>
                          <span className="font-medium">{links.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Primary:</span>
                          <span className="font-medium text-green-600">
                            {links.filter(l => l.relationship === 'primary').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Associated:</span>
                          <span className="font-medium text-blue-600">
                            {links.filter(l => l.relationship === 'associated').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                          <span className="font-medium text-orange-600">
                            {links.filter(l => l.relationship === 'reference').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Grid */}
                <div className={`flex-1 overflow-y-auto ${
                  activeTab === 'media' ? 'block' : 'hidden lg:block'
                }`}>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Linked Media ({fullMediaData.length || links.length})
                    </h3>
                    
                    {(fullMediaData.length > 0 || links.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(fullMediaData.length > 0 ? fullMediaData : links.map(link => link.media)).map((media, index) => {
                          const link = fullMediaData.length > 0 ? links.find(l => l.media.id === media.id) : links[index];
                          return (
                          <div key={media.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                            {/* Media Preview */}
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                              {media.type === 'image' ? (
                                <img
                                  src={`${getBackendUrl()}/api/multimedia/media/${media.id}/download`}
                                  alt={media.originalName}
                                  className="w-full h-full object-cover"
                                />
                              ) : media.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                  <FileVideo className="h-12 w-12 text-gray-400" />
                                </div>
                              ) : media.type === 'audio' ? (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                                  <Music className="h-12 w-12 text-white" />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileVideo className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Relationship Badge */}
                              {link && (
                                <div className="absolute top-2 left-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    link.relationship === 'primary' 
                                      ? 'bg-green-500 text-white'
                                      : link.relationship === 'associated'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-orange-500 text-white'
                                  }`}>
                                    {link.relationship.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Media Info */}
                            <div className="p-4 space-y-3">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {media.originalName}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                  {media.type} • {formatFileSize(media.metadata?.fileSize || 0)}
                                </p>
                              </div>

                              {/* Media Metadata */}
                              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                                {media.metadata?.device && (
                                  <div className="flex items-center space-x-1">
                                    <Smartphone className="h-3 w-3" />
                                    <span className="truncate">{media.metadata.device}</span>
                                  </div>
                                )}
                                {media.metadata?.gps && media.metadata.gps.latitude && media.metadata.gps.longitude && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3 text-green-600" />
                                    <span>GPS Available</span>
                                  </div>
                                )}
                                {media.metadata?.dateTaken && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(media.metadata.dateTaken)}</span>
                                  </div>
                                )}
                              </div>

                              {/* Camera Settings for Images */}
                              {media.type === 'image' && media.metadata?.cameraSettings && 
                               (media.metadata.cameraSettings.fNumber || media.metadata.cameraSettings.iso) && (
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  {media.metadata.cameraSettings.fNumber && (
                                    <div>f/{media.metadata.cameraSettings.fNumber}</div>
                                  )}
                                  {media.metadata.cameraSettings.iso && (
                                    <div>ISO {media.metadata.cameraSettings.iso}</div>
                                  )}
                                </div>
                              )}

                              {/* Video/Audio Duration */}
                              {media.type === 'video' && media.metadata?.videoMetadata?.duration && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Duration: {Math.round(media.metadata.videoMetadata.duration)}s
                                </div>
                              )}
                              {media.type === 'audio' && media.metadata?.audioMetadata?.duration && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Duration: {Math.round(media.metadata.audioMetadata.duration)}s
                                </div>
                              )}

                              {/* Tags */}
                              {media.metadata?.tags && media.metadata.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {media.metadata.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {media.metadata.tags.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{media.metadata.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex space-x-2 pt-2">
                                {link && (
                                  <button
                                    onClick={() => handleUnlink(media.id, (fullNodeData || node).id)}
                                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                  >
                                    Unlink
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    // Download media
                                    const downloadLink = document.createElement('a');
                                    downloadLink.href = `${getBackendUrl()}/api/multimedia/media/${media.id}/download`;
                                    downloadLink.download = media.originalName;
                                    downloadLink.click();
                                  }}
                                  className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <FileVideo className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Media Linked
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          This memory node doesn't have any linked media yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading links...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Links Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all connections between your media and memory nodes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
              <Network className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Mobile-first responsive controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search - Full width on mobile */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media or nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Filter and Sort - Stack on mobile, side by side on tablet+ */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base min-w-0 sm:min-w-[140px]"
            >
              <option value="all">All Links</option>
              <option value="primary">Primary</option>
              <option value="associated">Associated</option>
              <option value="reference">Reference</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base min-w-0 sm:min-w-[140px]"
            >
              <option value="date">Sort by Date</option>
              <option value="media">Sort by Media</option>
              <option value="node">Sort by Node</option>
              <option value="relationship">Sort by Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Links</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{links.length}</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Primary Links</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {links.filter(l => l.relationship === 'primary').length}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Associated Links</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {links.filter(l => l.relationship === 'associated').length}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Reference Links</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {links.filter(l => l.relationship === 'reference').length}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Links Grid */}
      {sortedLinks.length > 0 ? (
        <div className="space-y-3">
          {(() => {
            // Group links by node ID
            const groupedLinks = sortedLinks.reduce((acc, link) => {
              if (!acc[link.node.id]) {
                acc[link.node.id] = [];
              }
              acc[link.node.id].push(link);
              return acc;
            }, {} as Record<string, LinkData[]>);

            return Object.entries(groupedLinks).map(([nodeId, links]) => (
              <LinkCard key={nodeId} nodeId={nodeId} links={links} />
            ));
          })()}
        </div>
      ) : (
        <div className="text-center py-12">
          <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Links Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || filterType !== 'all' 
              ? 'No links match your current filters. Try adjusting your search or filters.'
              : 'Start by linking your media files to memory nodes to see connections here.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LinksOverview;
