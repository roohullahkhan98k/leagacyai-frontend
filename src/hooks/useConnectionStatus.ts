import { useState, useEffect, useCallback } from 'react';
import { getConnectionStatus, ConnectionStatusResponse } from '../services/multimediaApi';

export function useConnectionStatus(mediaId: string, nodeId: string) {
  const [status, setStatus] = useState<ConnectionStatusResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!mediaId || !nodeId) {
      setStatus(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await getConnectionStatus(mediaId, nodeId);
      setStatus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check connection status');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [mediaId, nodeId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const refresh = useCallback(() => {
    checkStatus();
  }, [checkStatus]);

  return { 
    status, 
    loading, 
    error, 
    refresh,
    isLinked: status?.isLinked || false,
    connectionInfo: status?.connectionInfo || null,
    mediaConnections: status?.mediaConnections || { total: 0, nodes: [] },
    nodeConnections: status?.nodeConnections || { total: 0, media: [] },
    messages: status?.messages || {
      mediaStatus: '',
      nodeStatus: '',
      connectionStatus: ''
    }
  };
}

export default useConnectionStatus;
