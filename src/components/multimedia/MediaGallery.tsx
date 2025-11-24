import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Grid3X3, List, Trash2, Download, Eye, X, FileVideo, Link2, MapPin, Clock, Settings, ExternalLink, Smartphone, Monitor, Tablet, Tag, Music, Image, Video, AlertTriangle } from 'lucide-react';
import { MediaFile, MemoryNode, getAllMedia, searchMedia, deleteMedia, SearchMediaRequest, getMediaUrl, linkMediaToNode, unlinkMediaFromNode } from '../../services/multimediaApi';
import Button from '../ui/Button';
import { toast } from 'react-toastify';
import ConnectionStatus from './ConnectionStatus';

interface MediaGalleryProps {
  onMediaSelect?: (media: MediaFile) => void;
  onMediaDelete?: (mediaId: string) => void;
  selectedNode?: MemoryNode | null;
  onDataRefresh?: () => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'name' | 'size' | 'type';

const MediaGallery: React.FC<MediaGalleryProps> = ({
  onMediaSelect,
  onMediaDelete,
  selectedNode,
  onDataRefresh,
  className = '',
}) => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    type?: 'image' | 'video';
    dateFrom?: string;
    dateTo?: string;
    device?: string;
  }>({});

  // Toast hooks

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (searchQuery || Object.keys(filters).length > 0) {
        const searchParams: SearchMediaRequest = {
          query: searchQuery || undefined,
          ...filters,
        };
        const result = await searchMedia(searchParams);
        setMedia(result.data.results || []);
      } else {
        const result = await getAllMedia();
        setMedia(result.data.media || []);
      }
    } catch (err) {
      console.error('Error loading media:', err);
      // Don't show error for empty data, just set empty array
      setMedia([]);
      setError(null); // Clear any previous errors
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    let sorted = [...media];
    
    switch (sortBy) {
      case 'date':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name':
        sorted.sort((a, b) => a.originalName.localeCompare(b.originalName));
        break;
      case 'size':
        sorted.sort((a, b) => b.metadata.fileSize - a.metadata.fileSize);
        break;
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }
    
    setFilteredMedia(sorted);
  }, [media, sortBy]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (media: MediaFile) => {
    setMediaToDelete(media);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mediaToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteMedia(mediaToDelete.id);
      setMedia(prev => prev.filter(m => m.id !== mediaToDelete.id));
      toast.success('Media deleted successfully', { position: 'top-right', autoClose: 3000 });
      onMediaDelete?.(mediaToDelete.id);
      onDataRefresh?.();
      setShowDeleteModal(false);
      setMediaToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete media';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLink = useCallback(async (mediaId: string, nodeId: string) => {
    try {
      await linkMediaToNode(mediaId, nodeId, { relationship: 'associated' });
      toast.success('Media linked to memory node successfully', { position: 'top-right', autoClose: 3000 });
      onDataRefresh?.();
    } catch (error) {
      console.error('Error linking media:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to link media';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
    }
  }, [onDataRefresh]);

  const handleUnlink = useCallback(async (mediaId: string, nodeId: string) => {
    try {
      await unlinkMediaFromNode(mediaId, nodeId);
      toast.success('Media unlinked from memory node successfully', { position: 'top-right', autoClose: 3000 });
      onDataRefresh?.();
    } catch (error) {
      console.error('Error unlinking media:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlink media';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
    }
  }, [onDataRefresh]);

  const handleDownload = useCallback((media: MediaFile) => {
    const link = document.createElement('a');
    link.href = getMediaUrl(media.id);
    link.download = media.originalName;
    link.click();
  }, []);



  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-6 w-6" />;
      case 'video': return <Video className="h-6 w-6" />;
      case 'audio': return <Music className="h-6 w-6" />;
      default: return <FileVideo className="h-6 w-6" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device?.toLowerCase().includes('iphone') || device?.toLowerCase().includes('android')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (device?.toLowerCase().includes('ipad') || device?.toLowerCase().includes('tablet')) {
      return <Tablet className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://maps.google.com/?q=${lat},${lng}`;
  };

  const MediaCard: React.FC<{ media: MediaFile }> = ({ media }) => {
    const [showModal, setShowModal] = useState(false);

    return (
      <>
        <div className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border border-gray-200 dark:border-gray-700">
          <div className="p-4">
            {/* Media Preview */}
            <div className="mb-4">
              <div 
                className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer relative"
                onClick={() => setShowModal(true)}
              >
                {media.type === 'image' ? (
                  <img
                    src={getMediaUrl(media.id)}
                    alt="Media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : media.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <video
                      src={getMediaUrl(media.id)}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  </div>
                ) : media.type === 'audio' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                    <div className="text-center text-white">
                      <Music className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm font-medium truncate px-2">{media.originalName}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                    {getMediaIcon(media.type)}
                  </div>
                )}

                {/* Media Type Badge */}
                <div className="absolute top-2 left-2">
                  <div className="flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                    {getMediaIcon(media.type)}
                    <span className="capitalize">{media.type}</span>
                  </div>
                </div>

                {/* GPS Badge - Only show when GPS coordinates are available */}
                {media.metadata?.gps && media.metadata.gps.latitude && media.metadata.gps.longitude && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>GPS</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute bottom-2 right-2 flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModal(true);
                    }}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(media);
                    }}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Type Badge */}
            <div className="flex items-center justify-center mb-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                media.type === 'image' 
                  ? 'bg-blue-500 text-white'
                  : media.type === 'video'
                  ? 'bg-purple-500 text-white'
                  : 'bg-pink-500 text-white'
              }`}>
                {media.type.toUpperCase()}
              </span>
            </div>

            {/* Media Info */}
            <div className="space-y-3">
              {/* Basic Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{formatFileSize(media.metadata?.fileSize || 0)}</span>
                <span>{formatDate(media.createdAt)}</span>
              </div>

              {/* Device Information */}
              {media.metadata?.device && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  {getDeviceIcon(media.metadata.device)}
                  <span className="truncate">{media.metadata.device}</span>
                </div>
              )}

              {/* GPS Location - Only show when available */}
              {media.metadata?.gps && media.metadata.gps.latitude && media.metadata.gps.longitude && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="truncate">
                    {media.metadata.gps.latitude.toFixed(4)}, {media.metadata.gps.longitude.toFixed(4)}
                  </span>
                  <a
                    href={getGoogleMapsUrl(media.metadata.gps.latitude, media.metadata.gps.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                    title="View on Google Maps"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Camera Settings (for images) - Only show when available */}
              {media.type === 'image' && media.metadata?.cameraSettings && 
               (media.metadata.cameraSettings.fNumber || media.metadata.cameraSettings.iso || 
                media.metadata.cameraSettings.exposureTime || media.metadata.cameraSettings.focalLength) && (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {media.metadata.cameraSettings.fNumber && (
                    <div className="flex items-center space-x-1">
                      <Settings className="h-3 w-3" />
                      <span>f/{media.metadata.cameraSettings.fNumber}</span>
                    </div>
                  )}
                  {media.metadata.cameraSettings.iso && (
                    <div className="flex items-center space-x-1">
                      <span>ISO {media.metadata.cameraSettings.iso}</span>
                    </div>
                  )}
                  {media.metadata.cameraSettings.exposureTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{media.metadata.cameraSettings.exposureTime}s</span>
                    </div>
                  )}
                  {media.metadata.cameraSettings.focalLength && (
                    <div className="flex items-center space-x-1">
                      <span>{media.metadata.cameraSettings.focalLength}mm</span>
                    </div>
                  )}
                </div>
              )}

              {/* Video specific metadata - Only show when available */}
              {media.type === 'video' && media.metadata?.videoMetadata && 
               (media.metadata.videoMetadata.duration || media.metadata.videoMetadata.resolution) && (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {media.metadata.videoMetadata.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{Math.round(media.metadata.videoMetadata.duration)}s</span>
                    </div>
                  )}
                  {media.metadata.videoMetadata.resolution && (
                    <div className="flex items-center space-x-1">
                      <Monitor className="h-3 w-3" />
                      <span>{media.metadata.videoMetadata.resolution}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Audio specific metadata - Only show when available */}
              {media.type === 'audio' && media.metadata?.audioMetadata && 
               (media.metadata.audioMetadata.duration || media.metadata.audioMetadata.bitrate) && (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {media.metadata.audioMetadata.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{Math.round(media.metadata.audioMetadata.duration)}s</span>
                    </div>
                  )}
                  {media.metadata.audioMetadata.bitrate && (
                    <div className="flex items-center space-x-1">
                      <span>{Math.round(media.metadata.audioMetadata.bitrate / 1000)} kbps</span>
                    </div>
                  )}
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
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {media.metadata.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{media.metadata.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
              
              <button
                onClick={() => handleDeleteClick(media)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Connection Status */}
          {selectedNode && (
            <div className="mt-3">
              <ConnectionStatus
                mediaId={media.id}
                nodeId={selectedNode.id}
                onLink={() => handleLink(media.id, selectedNode.id)}
                onUnlink={() => handleUnlink(media.id, selectedNode.id)}
                className="text-xs"
              />
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Media Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Media Display */}
                  <div className="space-y-4">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {media.type === 'image' ? (
                        <img
                          src={getMediaUrl(media.id)}
                          alt="Media"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileVideo className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Media Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {media.type.toUpperCase()}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>📅 Created: {new Date(media.createdAt).toLocaleString()}</div>
                        <div>📏 Size: {Math.round(media.metadata.fileSize / 1024)} KB</div>
                        {media.metadata.device && (
                          <div>📷 Device: {media.metadata.device}</div>
                        )}
                        {media.metadata.location && (
                          <div>📍 Location: {media.metadata.location}</div>
                        )}
                        {media.metadata.width && media.metadata.height && (
                          <div>📐 Dimensions: {media.metadata.width} × {media.metadata.height}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDownload(media)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          onMediaSelect?.(media);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Link2 className="h-4 w-4" />
                        <span>Link to Memory</span>
                      </button>
                    </div>
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
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading media...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-2">{error}</div>
        <Button onClick={loadMedia}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Media Gallery ({filteredMedia.length})
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as 'image' | 'video' || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid/List */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No media found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'Upload some media files to get started'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredMedia.map((mediaItem) => (
            <MediaCard key={mediaItem.id} media={mediaItem} />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && mediaToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            {/* Close button */}
            {!isDeleting && (
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
                Delete Media?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">"{mediaToDelete.originalName}"</span>?
              </p>
              <p className="text-sm text-error-600 dark:text-error-400 mt-2">
                This action cannot be undone. The file and all its links to memory nodes will be permanently deleted.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="border-error-600 text-error-600 hover:bg-error-50 dark:border-error-400 dark:text-error-400 dark:hover:bg-error-900/30"
              >
                {isDeleting ? (
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
    </div>
  );
};

export default MediaGallery;
