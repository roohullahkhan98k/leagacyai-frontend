import { useState, useEffect } from 'react';
import { checkMediaAvailability, getMediaLinkedNodes } from '../services/multimediaApi';

export function useMediaAvailability(mediaId: string | undefined) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [linkedNodes, setLinkedNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaId) {
      setIsAvailable(null);
      setLinkedNodes([]);
      return;
    }

    const checkAvailability = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getMediaLinkedNodes(mediaId);
        const available = response.data.linkedNodes.length === 0;
        setIsAvailable(available);
        setLinkedNodes(response.data.linkedNodes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check media availability');
        setIsAvailable(null);
        setLinkedNodes([]);
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [mediaId]);

  return { isAvailable, linkedNodes, loading, error };
}
