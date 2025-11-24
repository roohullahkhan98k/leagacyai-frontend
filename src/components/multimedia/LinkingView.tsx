import React, { useState, useEffect, useCallback } from 'react';
import { 
  Link2, Search, Filter, Grid3X3, List, Plus, Eye, Trash2, 
  Download, MoreVertical, Calendar, MapPin, Camera, Tag, 
  Users, FileText, Settings, BarChart3, Zap, Star, Heart, 
  Bookmark, Share, ExternalLink, ArrowRight, ArrowLeft, 
  CheckCircle, XCircle, AlertCircle, Info, Loader2, 
  Link as LinkIcon, Unlink, Target, Layers, Network,
  Brain, Image, Video, FileImage, FileVideo, Clock,
  TrendingUp, Globe, Smartphone, Monitor, Tablet
} from 'lucide-react';
import { MediaFile, MemoryNode, getMediaForNode, getNodesForMedia, linkMediaToNode, unlinkMediaFromNode, bulkLinkMedia, getAllMedia, getAllNodes, formatFileSize, formatDate, getMediaUrl, getMediaLinkedNodes, getNodeLinkedMedia } from '../../services/multimediaApi';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { toast } from 'react-toastify';
import { useMediaAvailability } from '../../hooks/useMediaAvailability';
import { useNodeAvailability } from '../../hooks/useNodeAvailability';
import ConnectionStatus from './ConnectionStatus';

interface LinkingViewProps {
  selectedNode?: MemoryNode | null;
  selectedMedia?: MediaFile | null;
  onLinkChange?: (linkedMedia: MediaFile[], linkedNodes: MemoryNode[]) => void;
  onDataRefresh?: () => void;
  className?: string;
}

type RelationshipType = 'primary' | 'associated' | 'reference';
type ViewMode = 'grid' | 'list' | 'network';
type FilterType = 'all' | 'linked' | 'unlinked' | 'primary' | 'associated' | 'reference';
type TabType = 'linked' | 'unlinked';

const LinkingView: React.FC<LinkingViewProps> = ({
  selectedNode,
  selectedMedia,
  onLinkChange,
  onDataRefresh,
  className = '',
}) => {
  const [availableMedia, setAvailableMedia] = useState<MediaFile[]>([]);
  const [availableNodes, setAvailableNodes] = useState<MemoryNode[]>([]);
  const [linkedMedia, setLinkedMedia] = useState<MediaFile[]>([]);
  const [linkedNodes, setLinkedNodes] = useState<MemoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('unlinked');
  const [error, setError] = useState<string | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(new Set());
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('associated');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);

  // Toast hooks

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedNode) {
        // Load media linked to this specific node
        const nodeMediaResult = await getNodeLinkedMedia(selectedNode.id);
        const linkedMediaForNode = nodeMediaResult.data.linkedMedia || [];
        setLinkedMedia(linkedMediaForNode);
        
        // Load all media and check which ones are available (not linked to any node)
        const allMediaResult = await getAllMedia();
        const allMedia = allMediaResult.data.media || [];
        
        // Check availability for each media item
        const availabilityPromises = allMedia.map(async (media) => {
          try {
            const mediaNodesResult = await getMediaLinkedNodes(media.id);
            const isLinkedToAnyNode = (mediaNodesResult.data.linkedNodes || []).length > 0;
            return { media, isAvailable: !isLinkedToAnyNode };
          } catch {
            return { media, isAvailable: true }; // Assume available if check fails
          }
        });
        
        const availabilityResults = await Promise.all(availabilityPromises);
        const availableMediaItems = availabilityResults
          .filter(result => result.isAvailable)
          .map(result => result.media);
        
        setAvailableMedia(availableMediaItems);
        setLinkedNodes([selectedNode]); // Only the selected node is relevant
        
      } else if (selectedMedia) {
        // Load nodes linked to this specific media
        const mediaNodesResult = await getMediaLinkedNodes(selectedMedia.id);
        const linkedNodesForMedia = mediaNodesResult.data.linkedNodes || [];
        setLinkedNodes(linkedNodesForMedia);
        
        // Load all nodes and check which ones are available (not linked to any media)
        const allNodesResult = await getAllNodes();
        const allNodes = allNodesResult.data.nodes || [];
        
        // Check availability for each node
        const availabilityPromises = allNodes.map(async (node) => {
          try {
            const nodeMediaResult = await getNodeLinkedMedia(node.id);
            const isLinkedToAnyMedia = (nodeMediaResult.data.linkedMedia || []).length > 0;
            return { node, isAvailable: !isLinkedToAnyMedia };
          } catch {
            return { node, isAvailable: true }; // Assume available if check fails
          }
        });
        
        const availabilityResults = await Promise.all(availabilityPromises);
        const availableNodeItems = availabilityResults
          .filter(result => result.isAvailable)
          .map(result => result.node);
        
        setAvailableNodes(availableNodeItems);
        setLinkedMedia([selectedMedia]); // Only the selected media is relevant
        
      } else {
        // Load all data and determine what's linked vs available
        const [allMediaResult, allNodesResult] = await Promise.all([
          getAllMedia(),
          getAllNodes()
        ]);
        
        const allMedia = allMediaResult.data.media || [];
        const allNodes = allNodesResult.data.nodes || [];
        
        // Check media availability
        const mediaAvailabilityPromises = allMedia.map(async (media) => {
          try {
            const mediaNodesResult = await getMediaLinkedNodes(media.id);
            const isLinkedToAnyNode = (mediaNodesResult.data.linkedNodes || []).length > 0;
            return { media, isLinked: isLinkedToAnyNode };
          } catch {
            return { media, isLinked: false };
          }
        });
        
        // Check node availability
        const nodeAvailabilityPromises = allNodes.map(async (node) => {
          try {
            const nodeMediaResult = await getNodeLinkedMedia(node.id);
            const isLinkedToAnyMedia = (nodeMediaResult.data.linkedMedia || []).length > 0;
            return { node, isLinked: isLinkedToAnyMedia };
          } catch {
            return { node, isLinked: false };
          }
        });
        
        const [mediaResults, nodeResults] = await Promise.all([
          Promise.all(mediaAvailabilityPromises),
          Promise.all(nodeAvailabilityPromises)
        ]);
        
        const linkedMediaItems = mediaResults
          .filter(result => result.isLinked)
          .map(result => result.media);
        const availableMediaItems = mediaResults
          .filter(result => !result.isLinked)
          .map(result => result.media);
        
        const linkedNodeItems = nodeResults
          .filter(result => result.isLinked)
          .map(result => result.node);
        const availableNodeItems = nodeResults
          .filter(result => !result.isLinked)
          .map(result => result.node);
        
        setLinkedMedia(linkedMediaItems);
        setAvailableMedia(availableMediaItems);
        setLinkedNodes(linkedNodeItems);
        setAvailableNodes(availableNodeItems);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setAvailableMedia([]);
      setAvailableNodes([]);
      setLinkedMedia([]);
      setLinkedNodes([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [selectedNode, selectedMedia]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLinkMedia = useCallback(async (mediaIds: string[], nodeIds: string[], relationship: RelationshipType = 'associated') => {
    try {
      setLoading(true);
      
      if (mediaIds.length === 1 && nodeIds.length === 1) {
        // Single link
        try {
          await linkMediaToNode(mediaIds[0], nodeIds[0], { relationship });
          toast.success('Media linked to memory node successfully', { position: 'top-right', autoClose: 3000 });
        } catch (err: any) {
          if (err.message && err.message.includes('already linked')) {
            toast.info('This media is already linked to the memory node', { position: 'top-right', autoClose: 3000 });
          } else {
            throw err;
          }
        }
      } else {
        // Bulk link
        const promises = nodeIds.map(async (nodeId) => {
          try {
            return await bulkLinkMedia(mediaIds, nodeId, relationship);
          } catch (err: any) {
            if (err.message && err.message.includes('already linked')) {
              toast.info('Some media items were already linked to this node', { position: 'top-right', autoClose: 3000 });
              return { success: true };
            }
            throw err;
          }
        });
        await Promise.all(promises);
        toast.success(`${mediaIds.length} media items linked to ${nodeIds.length} nodes`, { position: 'top-right', autoClose: 3000 });
      }
      
      // Reload data
      await loadData();
      onLinkChange?.(linkedMedia, linkedNodes);
      onDataRefresh?.();
      
      // Clear selections
      setSelectedMediaIds(new Set());
      setSelectedNodeIds(new Set());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to link media';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadData, linkedMedia, linkedNodes, onLinkChange]);

  const handleUnlinkMedia = useCallback(async (mediaIds: string[], nodeIds: string[]) => {
    try {
      setLoading(true);
      
      const promises = mediaIds.flatMap(mediaId =>
        nodeIds.map(nodeId => unlinkMediaFromNode(mediaId, nodeId))
      );
      await Promise.all(promises);
      
      toast.success(`${mediaIds.length} media items unlinked from ${nodeIds.length} nodes`, { position: 'top-right', autoClose: 3000 });
      
      // Reload data
      await loadData();
      onLinkChange?.(linkedMedia, linkedNodes);
      onDataRefresh?.();
      
      // Clear selections
      setSelectedMediaIds(new Set());
      setSelectedNodeIds(new Set());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlink media';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadData, linkedMedia, linkedNodes, onLinkChange]);

  const toggleMediaSelection = useCallback((mediaId: string) => {
    setSelectedMediaIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  }, []);

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

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

  const filteredMedia = availableMedia.filter(media => {
    if (searchQuery && !media.originalName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredNodes = availableNodes.filter(node => {
    if (searchQuery && !node.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const MediaCard: React.FC<{ media: MediaFile; isLinked?: boolean; relationship?: RelationshipType }> = ({ media, isLinked = false, relationship }) => (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${isLinked ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
        {media.type === 'image' ? (
          <img
            src={getMediaUrl(media.id)}
            alt={media.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileVideo className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2">
          <input
            type="checkbox"
            checked={selectedMediaIds.has(media.id)}
            onChange={() => toggleMediaSelection(media.id)}
            className="w-4 h-4 text-primary-600 bg-white rounded border-gray-300 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Relationship Badge */}
        {relationship && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRelationshipColor(relationship)}`}>
            {getRelationshipIcon(relationship)}
            <span className="capitalize">{relationship}</span>
          </div>
        )}

        {/* Linked Status */}
        {isLinked && (
          <div className="absolute bottom-2 right-2">
            <div className="p-1 bg-green-500 rounded-full">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
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
          <span>{formatFileSize(media.metadata?.fileSize || 0)}</span>
        </div>
        {media.metadata?.dateTaken && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(media.metadata.dateTaken)}</span>
          </div>
        )}
        
        {/* Connection Status */}
        {selectedNode && (
          <div className="mt-3">
            <ConnectionStatus
              mediaId={media.id}
              nodeId={selectedNode.id}
              onLink={() => handleLinkMedia([media.id], [selectedNode.id], relationshipType)}
              onUnlink={() => handleUnlinkMedia([media.id], [selectedNode.id])}
              className="text-xs"
            />
          </div>
        )}
      </div>
    </Card>
  );

  const NodeCard: React.FC<{ node: MemoryNode; isLinked?: boolean }> = ({ node, isLinked = false }) => (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${isLinked ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedNodeIds.has(node.id)}
              onChange={() => toggleNodeSelection(node.id)}
              className="w-4 h-4 text-primary-600 bg-white rounded border-gray-300 focus:ring-2 focus:ring-primary-500"
            />
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              {node.type === 'event' ? <Calendar className="h-4 w-4 text-primary-600" /> :
               node.type === 'person' ? <Users className="h-4 w-4 text-primary-600" /> :
               <FileText className="h-4 w-4 text-primary-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                {node.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {node.description}
              </p>
            </div>
          </div>
          
          {isLinked && (
            <div className="p-1 bg-green-500 rounded-full">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(node.createdAt)}</span>
          </div>
          {(() => {
            const location = node.metadata?.location;
            return location && typeof location === 'string' ? (
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            ) : null;
          })()}
          {(() => {
            const participants = node.metadata?.participants;
            return participants && Array.isArray(participants) ? (
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{(participants as string[]).join(', ')}</span>
              </div>
            ) : null;
          })()}
        </div>
        
        {/* Connection Status */}
        {selectedMedia && (
          <div className="mt-3">
            <ConnectionStatus
              mediaId={selectedMedia.id}
              nodeId={node.id}
              onLink={() => handleLinkMedia([selectedMedia.id], [node.id], relationshipType)}
              onUnlink={() => handleUnlinkMedia([selectedMedia.id], [node.id])}
              className="text-xs"
            />
          </div>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading linking data...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Context */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {selectedNode ? `Linking Media to "${selectedNode.title}"` :
               selectedMedia ? `Linking "${selectedMedia.originalName}" to Memories` :
               'Media & Memory Linking'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedNode ? 'Select media files to link to this memory node' :
               selectedMedia ? 'Select memory nodes to link this media to' :
               'Connect your media files with memory nodes to create rich relationships'}
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media or nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Items</option>
            <option value="linked">Linked Only</option>
            <option value="unlinked">Unlinked Only</option>
            <option value="primary">Primary Links</option>
            <option value="associated">Associated Links</option>
            <option value="reference">Reference Links</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('network')}
              className={`p-2 rounded ${viewMode === 'network' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
            >
              <Network className="h-4 w-4" />
            </button>
          </div>

          {/* Bulk Actions */}
          {(selectedMediaIds.size > 0 || selectedNodeIds.size > 0) && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowRelationshipModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Link Selected ({selectedMediaIds.size + selectedNodeIds.size})
              </Button>
              <Button
                onClick={() => {
                  setSelectedMediaIds(new Set());
                  setSelectedNodeIds(new Set());
                }}
                variant="outline"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('linked')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'linked'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Linked ({linkedMedia.length + linkedNodes.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('unlinked')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'unlinked'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Link2 className="h-4 w-4" />
              <span>Available ({filteredMedia.length + filteredNodes.length})</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'linked' ? (
            /* Linked Tab Content */
            <div className="space-y-6">
              {linkedMedia.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Linked Media ({linkedMedia.length})
                  </h3>
                  <div className={`${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-4'
                  }`}>
                    {linkedMedia.map((media) => (
                      <MediaCard key={media.id} media={media} isLinked />
                    ))}
                  </div>
                </div>
              )}

              {linkedNodes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Linked Memory Nodes ({linkedNodes.length})
                  </h3>
                  <div className={`${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                  }`}>
                    {linkedNodes.map((node) => (
                      <NodeCard key={node.id} node={node} isLinked />
                    ))}
                  </div>
                </div>
              )}

              {linkedMedia.length === 0 && linkedNodes.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Linked Items
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedNode ? `No media is currently linked to "${selectedNode.title}"` :
                     selectedMedia ? `"${selectedMedia.originalName}" is not linked to any memory nodes` :
                     "No items are currently linked"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Available Tab Content */
            <div className="space-y-6">
              {filteredMedia.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Available Media ({filteredMedia.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <select
                        value={relationshipType}
                        onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="associated">Associated</option>
                        <option value="primary">Primary</option>
                        <option value="reference">Reference</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={`${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-4'
                  }`}>
                    {filteredMedia.map((media) => (
                      <MediaCard key={media.id} media={media} />
                    ))}
                  </div>
                </div>
              )}

              {filteredNodes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Available Memory Nodes ({filteredNodes.length})
                  </h3>
                  
                  <div className={`${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                  }`}>
                    {filteredNodes.map((node) => (
                      <NodeCard key={node.id} node={node} />
                    ))}
                  </div>
                </div>
              )}

              {filteredMedia.length === 0 && filteredNodes.length === 0 && (
                <div className="text-center py-12">
                  <Link2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Available Items
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedNode ? `No media available to link to "${selectedNode.title}"` :
                     selectedMedia ? `No memory nodes available to link "${selectedMedia.originalName}" to` :
                     "No items available for linking"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Relationship Modal */}
      {showRelationshipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Set Relationship Type
            </h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="primary"
                  checked={relationshipType === 'primary'}
                  onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
                  className="text-primary-600"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Primary</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Main/featured media for this memory</div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="associated"
                  checked={relationshipType === 'associated'}
                  onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
                  className="text-primary-600"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Associated</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Related media that supports the memory</div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="reference"
                  checked={relationshipType === 'reference'}
                  onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
                  className="text-primary-600"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Reference</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Media that references or mentions the memory</div>
                </div>
              </label>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  if (selectedMediaIds.size > 0 && selectedNodeIds.size > 0) {
                    handleLinkMedia(Array.from(selectedMediaIds), Array.from(selectedNodeIds), relationshipType);
                  }
                  setShowRelationshipModal(false);
                }}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
              >
                Create Links
              </Button>
              <Button
                onClick={() => setShowRelationshipModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkingView;
