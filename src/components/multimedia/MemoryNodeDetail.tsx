import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Calendar, MapPin, Users, Tag, Edit2, Trash2, 
  Plus, Link2, Image, Video, FileImage, FileVideo, Star, 
  Bookmark, Link as LinkIcon, Download, Share, MoreVertical,
  Clock, Globe, Smartphone, Monitor, Tablet, Camera,
  CheckCircle, XCircle, AlertCircle, Info, Loader2,
  Brain, Sparkles, TrendingUp, BarChart3, Eye, Heart
} from 'lucide-react';
import { MemoryNode, MediaFile, getMediaForNode, updateNode, deleteNode, formatDate, getMediaUrl } from '../../services/multimediaApi';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { toast } from 'react-toastify';

interface MemoryNodeDetailProps {
  node: MemoryNode;
  onBack: () => void;
  onEdit: (node: MemoryNode) => void;
  onDelete: (nodeId: string) => void;
  onLinkMedia: (node: MemoryNode) => void;
  className?: string;
}

type RelationshipType = 'primary' | 'associated' | 'reference';

const MemoryNodeDetail: React.FC<MemoryNodeDetailProps> = ({
  node,
  onBack,
  onEdit,
  onDelete,
  onLinkMedia,
  className = '',
}) => {
  const [linkedMedia, setLinkedMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());

  // Toast hooks

  const loadLinkedMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getMediaForNode(node.id);
      setLinkedMedia(result.data.media || []);
    } catch (err) {
      console.error('Error loading linked media:', err);
      setLinkedMedia([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [node.id]);

  useEffect(() => {
    loadLinkedMedia();
  }, [loadLinkedMedia]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Are you sure you want to delete "${node.title}"? This will also remove all linked media relationships.`)) {
      return;
    }

    try {
      await deleteNode(node.id);
      toast.success(`"${node.title}" deleted successfully`, { position: 'top-right', autoClose: 3000 });
      onDelete(node.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete memory node';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
    }
  }, [node.id, node.title, onDelete]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'person': return <Users className="h-5 w-5 text-green-600" />;
      case 'timeline': return <Clock className="h-5 w-5 text-purple-600" />;
      default: return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'person': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'timeline': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getRelationshipColor = (relationship: RelationshipType) => {
    switch (relationship) {
      case 'primary': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'associated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'reference': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getRelationshipIcon = (relationship: RelationshipType) => {
    switch (relationship) {
      case 'primary': return <Star className="h-3 w-3" />;
      case 'associated': return <Link2 className="h-3 w-3" />;
      case 'reference': return <Bookmark className="h-3 w-3" />;
      default: return <LinkIcon className="h-3 w-3" />;
    }
  };

  const MediaCard: React.FC<{ media: MediaFile; relationship?: RelationshipType }> = ({ media, relationship = 'associated' }) => (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg group">
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
        {media.type === 'image' ? (
          <img
            src={getMediaUrl(media.id)}
            alt={media.originalName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileVideo className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Relationship Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRelationshipColor(relationship)}`}>
          {getRelationshipIcon(relationship)}
          <span className="capitalize">{relationship}</span>
        </div>

        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <input
            type="checkbox"
            checked={selectedMedia.has(media.id)}
            onChange={() => {
              setSelectedMedia(prev => {
                const newSet = new Set(prev);
                if (newSet.has(media.id)) {
                  newSet.delete(media.id);
                } else {
                  newSet.add(media.id);
                }
                return newSet;
              });
            }}
            className="w-4 h-4 text-primary-600 bg-white rounded border-gray-300 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <Eye className="h-4 w-4 text-gray-700" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 text-gray-700" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <Share className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
          {media.originalName}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center space-x-1">
            {media.type === 'image' ? <FileImage className="h-3 w-3" /> : <FileVideo className="h-3 w-3" />}
            <span>{media.type}</span>
          </span>
          {media.metadata?.dateTaken && (
            <span className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(media.metadata.dateTaken)}</span>
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading memory details...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {node.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {node.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onLinkMedia(node)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Link Media
          </Button>
          <Button
            onClick={() => onEdit(node)}
            variant="outline"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Node Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Memory Details</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getNodeColor(node.type)}`}>
                  {getNodeIcon(node.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{node.type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Memory Type</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Created {formatDate(node.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Creation Date</p>
                </div>
              </div>

              {node.metadata?.location && typeof node.metadata.location === 'string' && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {String(node.metadata.location)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  </div>
                </div>
              )}

              {node.metadata?.participants && Array.isArray(node.metadata.participants) && (
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {Array.isArray(node.metadata.participants) ? (node.metadata.participants as string[]).map(String).join(', ') : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Participants</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Linked Media */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Linked Media ({linkedMedia.length})
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
                  >
                    <Image className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {linkedMedia.length > 0 ? (
              <div className={`${viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
              }`}>
                {linkedMedia.map((media) => (
                  <MediaCard key={media.id} media={media} relationship="associated" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Media Linked Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Link photos and videos to this memory to bring it to life
                </p>
                <Button
                  onClick={() => onLinkMedia(node)}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Link Media
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Media</span>
                <span className="font-semibold text-gray-900 dark:text-white">{linkedMedia.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Images</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {linkedMedia.filter(m => m.type === 'image').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Videos</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {linkedMedia.filter(m => m.type === 'video').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(node.createdAt)}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => onLinkMedia(node)}
                className="w-full justify-start bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Link More Media
              </Button>
              <Button
                onClick={() => onEdit(node)}
                variant="outline"
                className="w-full justify-start"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Memory
              </Button>
              <Button
                onClick={() => {
                  // Share functionality
                  toast.info('Share functionality coming soon!', { position: 'top-right', autoClose: 3000 });
                }}
                variant="outline"
                className="w-full justify-start"
              >
                <Share className="h-4 w-4 mr-2" />
                Share Memory
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <Plus className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Memory created</p>
                  <p className="text-xs text-gray-500">{formatDate(node.createdAt)}</p>
                </div>
              </div>
              
              {linkedMedia.length > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Link2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {linkedMedia.length} media linked
                    </p>
                    <p className="text-xs text-gray-500">Recently</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemoryNodeDetail;
