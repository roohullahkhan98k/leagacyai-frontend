import { authService } from './authService';

const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const base = rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';

// ==================== TYPES ====================

export interface AvatarRecord {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  model?: {
    path: string;
    url: string;
  };
  thumbnail_path?: string;
  lipsync?: Array<{
    id: string;
    path: string;
    url: string;
    createdAt: string;
  }>;
  audio?: {
    path: string;
    url: string;
  } | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Animation {
  id: string;
  avatar_id: string;
  user_id: string;
  avatar?: {
    id: string;
    name: string;
    model_url: string;
  };
  audio_path?: string;
  audio_url?: string;
  lipsync_path?: string;
  lipsync_url?: string;
  lipsync_data?: Record<string, unknown>;
  duration_seconds?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ListAvatarsResponse {
  ok: boolean;
  avatars: AvatarRecord[];
}

export interface AnimationHistoryResponse {
  ok: boolean;
  total: number;
  animations: Animation[];
}

export interface PreparePlaybackResponse {
  ok: boolean;
  config: {
    avatarId: string;
    modelUrl: string;
    lipsyncUrl?: string;
    audioUrl?: string;
  };
}

export interface UpdateMetadataResponse {
  ok: boolean;
  avatar: AvatarRecord;
}

export interface StartPipelineResponse {
  ok: boolean;
  jobId: string;
  status: string;
}

export interface PipelineJobResponse {
  ok: boolean;
  job: {
    id: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
  };
}

// ==================== HELPER FUNCTIONS ====================

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

/**
 * Convert relative asset URL to absolute URL
 */
export function absoluteAssetUrl(relativeUrl?: string): string | undefined {
  if (!relativeUrl) return undefined;
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  return `${base}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
}

// ==================== EXISTING API FUNCTIONS (Pipeline Service) ====================

/**
 * List all avatars for the authenticated user
 */
export async function listAvatars(): Promise<ListAvatarsResponse> {
  const res = await fetch(`${base}/api/avatar`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Failed to list avatars');
  }

  return res.json();
}

/**
 * Delete an avatar
 */
export async function deleteAvatar(avatarId: string): Promise<{ ok: boolean; removed: boolean }> {
  const res = await fetch(`${base}/api/avatar/${avatarId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Failed to delete avatar');
  }

  return res.json();
}

/**
 * Update avatar metadata
 */
export async function updateMetadata(
  avatarId: string,
  metadata: { name?: string; description?: string }
): Promise<UpdateMetadataResponse> {
  const res = await fetch(`${base}/api/avatar/${avatarId}/metadata`, {
    method: 'POST',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Failed to update metadata');
  }

  return res.json();
}

/**
 * Prepare avatar for playback
 */
export async function preparePlayback(
  avatarId: string,
  options: { audioUrl?: string }
): Promise<PreparePlaybackResponse> {
  const res = await fetch(`${base}/api/avatar/${avatarId}/prepare-playback`, {
    method: 'POST',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Failed to prepare playback');
  }

  return res.json();
}

/**
 * Start image to 3D model pipeline
 */
export async function startImageToModel(imageFile: File): Promise<StartPipelineResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch(`${base}/api/avatar/pipeline/image-to-model`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Failed to start image-to-model pipeline');
  }

  return res.json();
}

/**
 * Start audio to lipsync pipeline
 */
export async function startAudioToLipsync(
  avatarId: string,
  audioFile: File
): Promise<StartPipelineResponse> {
  const formData = new FormData();
  formData.append('audio', audioFile);

  const res = await fetch(`${base}/api/avatar/pipeline/${avatarId}/audio-to-lipsync`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Failed to start audio-to-lipsync pipeline');
  }

  return res.json();
}

/**
 * Get pipeline job status
 */
export async function getPipelineJob(jobId: string): Promise<PipelineJobResponse> {
  const res = await fetch(`${base}/api/avatar/pipeline/job/${jobId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Failed to get pipeline job status');
  }

  return res.json();
}

// ==================== NEW FEATURES (PostgreSQL) ====================

/**
 * Get animation history for a user (NEW - PostgreSQL)
 */
export async function getAnimationHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AnimationHistoryResponse> {
  const res = await fetch(
    `${base}/api/avatar/user/${userId}/history?limit=${limit}&offset=${offset}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Failed to get animation history');
  }

  return res.json();
}

/**
 * Delete a specific animation (NEW - PostgreSQL)
 */
export async function deleteAnimation(animationId: string): Promise<{ ok: boolean; removed: boolean }> {
  const res = await fetch(`${base}/api/avatar/animation/${animationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Failed to delete animation');
  }

  return res.json();
}

