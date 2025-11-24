export interface MediaFile {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  type: 'image' | 'video' | 'audio';
  mimeType: string;
  metadata: {
    fileSize: number;
    width?: number;
    height?: number;
    dateTaken?: string;
    device?: string;
    location?: string;
    format?: string;
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
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface MemoryNode {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'person' | 'timeline';
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MediaLink {
  linkId: string;
  mediaId: string;
  nodeId: string;
  relationship: 'primary' | 'associated' | 'reference';
  createdAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    mediaId: string;
    filename: string;
    originalName: string;
    type: string;
    metadata: MediaFile['metadata'];
    downloadUrl: string;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: {
    uploaded: Array<{
      mediaId: string;
      filename: string;
      originalName: string;
      type: string;
      metadata: MediaFile['metadata'];
      downloadUrl: string;
    }>;
    failed: any[];
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  };
}

export interface MediaListResponse {
  success: boolean;
  data: {
    media: MediaFile[];
    count: number;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface NodeListResponse {
  success: boolean;
  data: {
    nodes: MemoryNode[];
    count: number;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface CreateNodeRequest {
  title: string;
  description: string;
  type: 'event' | 'person' | 'timeline';
  metadata?: Record<string, unknown>;
}

export interface CreateNodeResponse {
  success: boolean;
  message: string;
  data: MemoryNode;
}

export interface LinkMediaRequest {
  relationship?: 'primary' | 'associated' | 'reference';
}

export interface LinkMediaResponse {
  success: boolean;
  message: string;
  data: {
    linkId: string;
    mediaId: string;
    nodeId: string;
    relationship: 'primary' | 'associated' | 'reference';
    media: MediaFile;
    node: MemoryNode;
  };
}

export interface SearchMediaRequest {
  query?: string;
  type?: 'image' | 'video';
  dateFrom?: string;
  dateTo?: string;
  device?: string;
  location?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchMediaResponse {
  success: boolean;
  data: {
    results: MediaFile[];
    count: number;
    criteria: {
      type?: string;
      dateFrom?: string;
      dateTo?: string;
      device?: string;
      location?: string;
      query?: string;
    };
  };
}

// Management API interfaces
export interface MediaManagementResponse {
  success: boolean;
  data: {
    media: MediaFile[];
    filters: {
      types: string[];
      statuses: string[];
      dateRanges: string[];
      devices: string[];
      locations: string[];
    };
    bulkActions: string[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface LinksManagementResponse {
  success: boolean;
  data: {
    links: Array<{
      linkId: string;
      media: {
        id: string;
        filename: string;
        originalName?: string;
        path?: string;
        type: 'image' | 'video' | 'audio';
        mimeType?: string;
        thumbnail: string;
        metadata?: {
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
        createdAt?: string;
        updatedAt?: string;
      };
      node: {
        id: string;
        title: string;
        description?: string;
        type: 'event' | 'person' | 'timeline';
        metadata?: Record<string, unknown>;
        createdAt?: string;
        updatedAt?: string;
      };
      relationship: 'primary' | 'associated' | 'reference';
      createdAt: string;
      actions: string[];
    }>;
    filters: {
      relationships: string[];
      dateRanges: string[];
      nodeTypes: string[];
    };
    bulkActions: string[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  data: {
    overview: {
      totalMedia: number;
      totalNodes: number;
      totalLinks: number;
      storageUsed: string;
      lastActivity: string;
    };
    mediaStats: {
      images: number;
      videos: number;
      unlinkedMedia: number;
      linkedMedia: number;
    };
    nodeStats: {
      events: number;
      people: number;
      timeline: number;
      nodesWithMedia: number;
      emptyNodes: number;
    };
    recentActivity: Array<{
      type: string;
      mediaId?: string;
      filename?: string;
      nodeId?: string;
      nodeTitle?: string;
      timestamp: string;
    }>;
    topNodes: Array<{
      nodeId: string;
      title: string;
      mediaCount: number;
      views: number;
    }>;
  };
}

import { authService } from './authService';

const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const base = rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';

const withBase = (path: string) => `${base}${path}`;

// ==================== AUTH HELPERS ====================

function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getAuthHeadersWithJSON(): HeadersInit {
  const token = authService.getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Upload endpoints
export async function uploadSingle(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('media', file);

  const res = await fetch(withBase('/api/multimedia/upload/single'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function uploadMultiple(files: File[]): Promise<MultipleUploadResponse> {
  const formData = new FormData();
  files.forEach(file => formData.append('media', file));

  const res = await fetch(withBase('/api/multimedia/upload/multiple'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// Media management
export async function getAllMedia(params?: {
  page?: number;
  limit?: number;
  type?: 'image' | 'video';
  sortBy?: 'dateTaken' | 'createdAt' | 'fileSize' | 'originalName';
  order?: 'asc' | 'desc';
}): Promise<MediaListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.type) searchParams.append('type', params.type);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.order) searchParams.append('order', params.order);

  const res = await fetch(withBase(`/api/multimedia/media?${searchParams}`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function getMedia(mediaId: string): Promise<{ success: boolean; data: MediaFile }> {
  const res = await fetch(withBase(`/api/multimedia/media/${mediaId}`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function downloadMedia(mediaId: string): Promise<Blob> {
  const res = await fetch(withBase(`/api/multimedia/media/${mediaId}/download`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.blob();
}

export async function updateMedia(mediaId: string, metadata: Partial<MediaFile['metadata']>): Promise<{ success: boolean; data: MediaFile }> {
  const res = await fetch(withBase(`/api/multimedia/media/${mediaId}`), {
    method: 'PUT',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify(metadata),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function deleteMedia(mediaId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(withBase(`/api/multimedia/media/${mediaId}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// Memory nodes
export async function createNode(payload: CreateNodeRequest): Promise<CreateNodeResponse> {
  const res = await fetch(withBase('/api/multimedia/nodes'), {
    method: 'POST',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function getAllNodes(params?: {
  page?: number;
  limit?: number;
  type?: 'event' | 'person' | 'timeline';
  sortBy?: 'createdAt' | 'title' | 'mediaCount';
  order?: 'asc' | 'desc';
}): Promise<NodeListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.type) searchParams.append('type', params.type);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.order) searchParams.append('order', params.order);

  const res = await fetch(withBase(`/api/multimedia/nodes?${searchParams}`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}


export async function getNode(nodeId: string): Promise<{ success: boolean; data: MemoryNode }> {
  const res = await fetch(withBase(`/api/multimedia/nodes/${nodeId}`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function updateNode(nodeId: string, payload: Partial<CreateNodeRequest>): Promise<{ success: boolean; data: MemoryNode }> {
  const res = await fetch(withBase(`/api/multimedia/nodes/${nodeId}`), {
    method: 'PUT',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function deleteNode(nodeId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(withBase(`/api/multimedia/nodes/${nodeId}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// Linking
export async function linkMediaToNode(mediaId: string, nodeId: string, payload: LinkMediaRequest = {}): Promise<LinkMediaResponse> {
  const res = await fetch(withBase(`/api/multimedia/link/${mediaId}/to/${nodeId}`), {
    method: 'POST',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function unlinkMediaFromNode(mediaId: string, nodeId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(withBase(`/api/multimedia/link/${mediaId}/from/${nodeId}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function getMediaForNode(nodeId: string): Promise<MediaListResponse> {
  const res = await fetch(withBase(`/api/multimedia/nodes/${nodeId}/media`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function getNodesForMedia(mediaId: string): Promise<NodeListResponse> {
  const res = await fetch(withBase(`/api/multimedia/media/${mediaId}/nodes`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function bulkLinkMedia(mediaIds: string[], nodeId: string, relationship: 'primary' | 'associated' | 'reference' = 'associated'): Promise<{ success: boolean; data: { linked: number } }> {
  const res = await fetch(withBase(`/api/multimedia/link/bulk/to/${nodeId}`), {
    method: 'POST',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify({ mediaIds, relationship }),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function bulkUnlinkMedia(mediaIds: string[], nodeId: string): Promise<{ success: boolean; data: { unlinked: number } }> {
  const res = await fetch(withBase(`/api/multimedia/unlink/bulk/from/${nodeId}`), {
    method: 'POST',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify({ mediaIds }),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// Search & discovery
export async function searchMedia(params: SearchMediaRequest): Promise<SearchMediaResponse> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set('query', params.query);
  if (params.type) searchParams.set('type', params.type);
  if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params.dateTo) searchParams.set('dateTo', params.dateTo);
  if (params.device) searchParams.set('device', params.device);
  if (params.location) searchParams.set('location', params.location);
  if (params.tags) searchParams.set('tags', params.tags.join(','));
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());

  const res = await fetch(withBase(`/api/multimedia/search/media?${searchParams.toString()}`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function searchNodes(params: { query?: string; type?: string; limit?: number; offset?: number }): Promise<NodeListResponse> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set('query', params.query);
  if (params.type) searchParams.set('type', params.type);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());

  const res = await fetch(withBase(`/api/multimedia/search/nodes?${searchParams.toString()}`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// Health check
export async function checkMultimediaHealth(): Promise<{ status: string; message: string }> {
  const res = await fetch(withBase('/health'), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// Management APIs
export async function getMediaManagement(params?: {
  view?: 'grid' | 'list' | 'table';
  filter?: 'linked' | 'unlinked' | 'all';
  sortBy?: 'dateTaken' | 'createdAt' | 'fileSize' | 'originalName';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<MediaManagementResponse> {
  const searchParams = new URLSearchParams();
  if (params?.view) searchParams.append('view', params.view);
  if (params?.filter) searchParams.append('filter', params.filter);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.order) searchParams.append('order', params.order);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const res = await fetch(withBase(`/api/multimedia/management/media?${searchParams}`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function getLinksManagement(params?: {
  view?: 'grid' | 'list' | 'table';
  filter?: 'recent' | 'primary' | 'associated' | 'reference';
  sortBy?: 'createdAt' | 'relationship' | 'mediaType';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<LinksManagementResponse> {
  const searchParams = new URLSearchParams();
  if (params?.view) searchParams.append('view', params.view);
  if (params?.filter) searchParams.append('filter', params.filter);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.order) searchParams.append('order', params.order);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const res = await fetch(withBase(`/api/multimedia/management/links?${searchParams}`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// Connection Status API
export interface ConnectionStatusResponse {
  success: boolean;
  data: {
    isLinked: boolean;
    connectionInfo: {
      linkId: string;
      relationship: string;
      linkedAt: string;
    } | null;
    mediaConnections: {
      total: number;
      nodes: Array<{
        nodeId: string;
        nodeTitle: string;
        relationship: string;
        linkedAt: string;
      }>;
    };
    nodeConnections: {
      total: number;
      media: Array<{
        mediaId: string;
        mediaName: string;
        relationship: string;
        linkedAt: string;
      }>;
    };
    messages: {
      mediaStatus: string;
      nodeStatus: string;
      connectionStatus: string;
    };
  };
}

export async function getConnectionStatus(
  mediaId: string, 
  nodeId: string
): Promise<ConnectionStatusResponse> {
  const response = await fetch(
    withBase(`/api/multimedia/connection-status/${mediaId}/${nodeId}`),
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Connection status check failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Check if media is available for linking (not linked to any node)
export async function checkMediaAvailability(mediaId: string): Promise<boolean> {
  const response = await fetch(
    withBase(`/api/multimedia/media/${mediaId}/nodes`),
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Media availability check failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data.linkedNodes.length === 0; // true if available, false if already linked
}

// Get all nodes that media is linked to
export async function getMediaLinkedNodes(mediaId: string) {
  const response = await fetch(
    withBase(`/api/multimedia/media/${mediaId}/nodes`),
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get media linked nodes: ${response.statusText}`);
  }
  
  return response.json();
}

// Get all media that node is linked to
export async function getNodeLinkedMedia(nodeId: string) {
  const response = await fetch(
    withBase(`/api/multimedia/nodes/${nodeId}/media`),
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get node linked media: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getDashboardAnalytics(): Promise<DashboardAnalyticsResponse> {
  const res = await fetch(withBase('/api/multimedia/analytics/dashboard'), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// Bulk operations
export async function bulkMediaOperation(action: string, mediaIds: string[], params?: any): Promise<{ success: boolean; data: any }> {
  const res = await fetch(withBase('/api/multimedia/bulk/media'), {
    method: 'POST',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify({
      action,
      mediaIds,
      params
    }),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// API Documentation
export async function getApiDocs(): Promise<any> {
  const res = await fetch(withBase('/api/multimedia/docs'), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

// Utility functions
export function getMediaUrl(mediaId: string): string {
  return withBase(`/api/multimedia/media/${mediaId}/download`);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
