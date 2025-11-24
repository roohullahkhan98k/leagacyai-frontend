import React, { useState, useEffect } from 'react';
import { 
  Link2, Unlink, Loader2, AlertCircle, CheckCircle, 
  Users, Calendar, ExternalLink, Info
} from 'lucide-react';
import { getConnectionStatus, ConnectionStatusResponse } from '../../services/multimediaApi';

interface ConnectionStatusProps {
  mediaId: string;
  nodeId: string;
  onLink?: () => void;
  onUnlink?: () => void;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  mediaId,
  nodeId,
  onLink,
  onUnlink,
  className = ''
}) => {
  const [status, setStatus] = useState<ConnectionStatusResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    if (!mediaId || !nodeId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await getConnectionStatus(mediaId, nodeId);
      setStatus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check connection status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [mediaId, nodeId]);

  if (loading) {
    return (
      <div className={`connection-status loading ${className}`}>
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Checking connection status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`connection-status error ${className}`}>
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className={`connection-status ${className}`}>
      {/* Main Status Message */}
      <div className="status-message mb-3">
        <div className="flex items-center space-x-2">
          <span className={`status-indicator ${status.isLinked ? 'connected' : 'disconnected'}`}>
            {status.isLinked ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
          </span>
          <span className="status-text text-sm font-medium text-gray-900 dark:text-white">
            {status.messages.connectionStatus}
          </span>
        </div>
      </div>

      {/* Connection Details */}
      {status.isLinked && status.connectionInfo && (
        <div className="connection-details bg-white dark:bg-gray-700 rounded-lg p-3 mb-3 border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Link2 className="h-3 w-3 text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">Relationship:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {status.connectionInfo.relationship}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-gray-600" />
              <span className="text-gray-600 dark:text-gray-400">Linked:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(status.connectionInfo.linkedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Connections Summary */}
      <div className="connections-summary bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-1">
            <Info className="h-3 w-3 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">{status.messages.mediaStatus}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Info className="h-3 w-3 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">{status.messages.nodeStatus}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="connection-actions">
        {status.isLinked ? (
          <button 
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
            onClick={onUnlink}
            title="Unlink this media from the memory node"
          >
            <Unlink className="h-4 w-4" />
            <span>Unlink</span>
          </button>
        ) : (
          <button 
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
            onClick={onLink}
            title="Link this media to the memory node"
          >
            <Link2 className="h-4 w-4" />
            <span>Link</span>
          </button>
        )}
      </div>

      {/* Detailed Connections */}
      {status.mediaConnections.total > 0 && (
        <div className="detailed-connections bg-white dark:bg-gray-700 rounded-lg p-3 mt-3 border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Media is connected to:</span>
          </h4>
          <ul className="space-y-1">
            {status.mediaConnections.nodes.map((node) => (
              <li key={node.nodeId} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">{node.nodeTitle}</span>
                  <span className="text-gray-500 dark:text-gray-400 capitalize">({node.relationship})</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {new Date(node.linkedAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status.nodeConnections.total > 0 && (
        <div className="detailed-connections bg-white dark:bg-gray-700 rounded-lg p-3 mt-3 border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Node has connected media:</span>
          </h4>
          <ul className="space-y-1">
            {status.nodeConnections.media.map((media) => (
              <li key={media.mediaId} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white truncate">{media.mediaName}</span>
                  <span className="text-gray-500 dark:text-gray-400 capitalize">({media.relationship})</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {new Date(media.linkedAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
