import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, MapPin, Search, Eye, X, Save, Link2, Clock, FileText, AlertTriangle } from 'lucide-react';
import { MemoryNode, getAllNodes, createNode, updateNode, deleteNode, CreateNodeRequest, formatDate } from '../../services/multimediaApi';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

interface MemoryNodeManagerProps {
  onNodeSelect?: (node: MemoryNode) => void;
  onNodeDelete?: (nodeId: string) => void;
  className?: string;
}

type NodeType = 'event' | 'person' | 'timeline';

const MemoryNodeManager: React.FC<MemoryNodeManagerProps> = ({
  onNodeSelect,
  onNodeDelete,
  className = '',
}) => {
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NodeType | ''>('');
  const [editingNode, setEditingNode] = useState<MemoryNode | null>(null);
  const [viewingNode, setViewingNode] = useState<MemoryNode | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNodeData, setNewNodeData] = useState<CreateNodeRequest>({
    title: '',
    description: '',
    type: 'event',
    metadata: {}
  });
  const [isCreating, setIsCreating] = useState(false);


  const loadNodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllNodes();
      setNodes(result.data.nodes || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load memory nodes';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);


  const handleUpdateNode = useCallback(async (nodeId: string, nodeData: Partial<CreateNodeRequest>) => {
    try {
      const result = await updateNode(nodeId, nodeData);
      setNodes(prev => prev.map(node => node.id === nodeId ? result.data : node));
      setEditingNode(null);
      toast.success('Memory node updated successfully', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update memory node';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
    }
  }, []);

  const handleCreateNode = async () => {
    if (!newNodeData.title.trim()) {
      toast.error('Please enter a title', { position: 'top-right', autoClose: 3000 });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createNode(newNodeData);
      setNodes(prev => [result.data, ...prev]);
      setShowCreateModal(false);
      setNewNodeData({
        title: '',
        description: '',
        type: 'event',
        metadata: {}
      });
      toast.success('Memory node created successfully', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create memory node';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsCreating(false);
    }
  };

  const [showDeleteNodeModal, setShowDeleteNodeModal] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<MemoryNode | null>(null);
  const [isDeletingNode, setIsDeletingNode] = useState(false);

  const handleDeleteNodeClick = (node: MemoryNode) => {
    setNodeToDelete(node);
    setShowDeleteNodeModal(true);
  };

  const handleDeleteNodeConfirm = async () => {
    if (!nodeToDelete) return;
    
    setIsDeletingNode(true);
    try {
      await deleteNode(nodeToDelete.id);
      setNodes(prev => prev.filter(node => node.id !== nodeToDelete.id));
      toast.success('Memory node deleted successfully', { position: 'top-right', autoClose: 3000 });
      onNodeDelete?.(nodeToDelete.id);
      setShowDeleteNodeModal(false);
      setNodeToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete memory node';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
      setError(errorMessage);
    } finally {
      setIsDeletingNode(false);
    }
  };

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'person':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'timeline':
        return <Clock className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case 'event':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700';
      case 'person':
        return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700';
      case 'timeline':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border border-gray-200 dark:border-gray-700';
    }
  };

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || node.type === selectedType;
    return matchesSearch && matchesType;
  });

  const NodeCard: React.FC<{ node: MemoryNode }> = ({ node }) => {
    const location = node.metadata?.location;
    const participants = node.metadata?.participants;
    const date = node.metadata?.date;
    const hasLocation = location && typeof location === 'string';
    const hasParticipants = participants && Array.isArray(participants);
    const hasDate = date && typeof date === 'string';
    const hasDescription = node.description && node.description.trim().length > 0;

    return (
      <div className={`group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${getNodeColor(node.type)}`}>
        {/* Header with Icon and Type */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                node.type === 'event' 
                  ? 'bg-blue-500 text-white'
                  : node.type === 'person'
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 text-white'
              }`}>
                {getNodeIcon(node.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                  {node.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    node.type === 'event' 
                      ? 'bg-blue-500 text-white'
                      : node.type === 'person'
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}>
                    {node.type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {hasDescription && (
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                {node.description}
              </p>
            </div>
          )}

          {/* Dynamic Metadata Grid */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            {hasLocation ? (
              <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {String(location)}
                </span>
              </div>
            ) : null}
            
            {hasParticipants ? (
              <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {Array.isArray(participants) ? participants.join(', ') : String(participants)}
                </span>
              </div>
            ) : null}
            
            {hasDate ? (
              <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {String(date)}
                </span>
              </div>
            ) : null}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Created {formatDate(node.createdAt)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewingNode(node)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setEditingNode(node)}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNodeSelect?.(node)}
                className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                title="Link Media"
              >
                <Link2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNodeClick(node);
                }}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // View Modal Component
  const ViewModal: React.FC<{ node: MemoryNode; onClose: () => void }> = ({ node, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {getNodeIcon(node.type)}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{node.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Type and Status */}
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                node.type === 'event' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : node.type === 'person'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
              }`}>
                {node.type.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Created: {formatDate(node.createdAt)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Updated: {formatDate(node.updatedAt)}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {node.description || 'No description provided'}
              </p>
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Details</h3>
              <div className="space-y-3">
                {(() => {
                  const location = node.metadata?.location;
                  return location && typeof location === 'string' ? (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Location</span>
                        <p className="text-gray-600 dark:text-gray-400">{location}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
                {(() => {
                  const participants = node.metadata?.participants;
                  return participants && Array.isArray(participants) ? (
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Participants</span>
                        <p className="text-gray-600 dark:text-gray-400">{(participants as string[]).join(', ')}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
                {(() => {
                  const date = node.metadata?.date;
                  return date && typeof date === 'string' ? (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Date</span>
                        <p className="text-gray-600 dark:text-gray-400">{date}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  setEditingNode(node);
                }}
                className="flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  onNodeSelect?.(node);
                }}
                className="flex items-center space-x-2"
              >
                <Link2 className="h-4 w-4" />
                <span>Link Media</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Modal Component
  const EditModal: React.FC<{ node: MemoryNode; onClose: () => void }> = ({ node, onClose }) => {
    const [formData, setFormData] = useState({
      title: node.title,
      description: node.description,
      type: node.type,
      location: (node.metadata?.location as string) || '',
      participants: (node.metadata?.participants as string[]) || [],
      date: (node.metadata?.date as string) || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const metadata: Record<string, any> = {};
      if (formData.location) metadata.location = formData.location;
      if (formData.participants.length > 0) metadata.participants = formData.participants;
      if (formData.date) metadata.date = formData.date;

      handleUpdateNode(node.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        metadata,
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Memory Node</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as NodeType }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="event">Event</option>
                  <option value="person">Person</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading memory nodes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-2">{error}</div>
        <Button onClick={loadNodes}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Memory Nodes ({nodes.length})
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as NodeType | '')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="event">Events</option>
            <option value="person">People</option>
            <option value="timeline">Timeline</option>
          </select>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Node</span>
          </Button>
        </div>
      </div>

      {/* Nodes Grid */}
      {filteredNodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedType ? 'No nodes found' : 'No memory nodes yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedType 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first memory node to get started'
            }
          </p>
          {!searchQuery && !selectedType && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Memory Node</span>
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {viewingNode && (
        <ViewModal 
          node={viewingNode} 
          onClose={() => setViewingNode(null)} 
        />
      )}
      
      {editingNode && (
        <EditModal 
          node={editingNode} 
          onClose={() => setEditingNode(null)} 
        />
      )}

      {/* Create Node Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isCreating && setShowCreateModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Memory Node
              </h2>
              {!isCreating && (
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newNodeData.title}
                  onChange={(e) => setNewNodeData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Paris Vacation 2025"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isCreating}
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={newNodeData.type}
                  onChange={(e) => setNewNodeData(prev => ({ ...prev, type: e.target.value as 'event' | 'person' | 'timeline' }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  disabled={isCreating}
                >
                  <option value="event">Event</option>
                  <option value="person">Person</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newNodeData.description}
                  onChange={(e) => setNewNodeData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this memory..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isCreating}
                />
              </div>

              {/* Metadata - Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={(newNodeData.metadata?.location as string) || ''}
                  onChange={(e) => setNewNodeData(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, location: e.target.value }
                  }))}
                  placeholder="e.g., Paris, France"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  disabled={isCreating}
                />
              </div>

              {/* Metadata - Date */}
              {newNodeData.type === 'event' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={(newNodeData.metadata?.date as string) || ''}
                    onChange={(e) => setNewNodeData(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, date: e.target.value }
                    }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    disabled={isCreating}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateNode}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Node
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Node Confirmation Modal */}
      {showDeleteNodeModal && nodeToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeletingNode && setShowDeleteNodeModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            {/* Close button */}
            {!isDeletingNode && (
              <button
                onClick={() => setShowDeleteNodeModal(false)}
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
                Delete Memory Node?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">"{nodeToDelete.title}"</span>?
              </p>
              <p className="text-sm text-error-600 dark:text-error-400 mt-2">
                This action cannot be undone. The node will be deleted, but linked media files will remain.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteNodeModal(false)}
                disabled={isDeletingNode}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteNodeConfirm}
                disabled={isDeletingNode}
                className="border-error-600 text-error-600 hover:bg-error-50 dark:border-error-400 dark:text-error-400 dark:hover:bg-error-900/30"
              >
                {isDeletingNode ? (
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

export default MemoryNodeManager;