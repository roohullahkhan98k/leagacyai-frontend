import { useState, useEffect } from 'react';
import { getNodeLinkedMedia } from '../services/multimediaApi';

export function useNodeAvailability(nodeId: string | undefined) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [linkedMedia, setLinkedMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nodeId) {
      setIsAvailable(null);
      setLinkedMedia([]);
      return;
    }

    const checkAvailability = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getNodeLinkedMedia(nodeId);
        const available = response.data.linkedMedia.length === 0;
        setIsAvailable(available);
        setLinkedMedia(response.data.linkedMedia || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check node availability');
        setIsAvailable(null);
        setLinkedMedia([]);
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [nodeId]);

  return { isAvailable, linkedMedia, loading, error };
}
