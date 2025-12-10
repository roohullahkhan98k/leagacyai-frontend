export interface Voice {
  voiceId: string;
  name: string;
  category: string;
  description: string;
  labels: Record<string, unknown>;
  isCloned: boolean;
  samples?: string[];
}

export interface CloneVoiceRequest {
  audio: File;
  voiceName: string;
  description?: string;
  accent: string; // REQUIRED: Accent code (en, ar, hi, es, fr, de, etc.)
}

export interface CloneVoiceResponse {
  success: boolean;
  voiceId: string;
  name: string;
  status: string;
  accent?: string;
  sampleFilePath?: string;
  timestamp: string;
}

export interface GenerateSpeechRequest {
  text: string;
  voiceId: string;
  accent: string; // REQUIRED: Accent code for generation
  modelId?: string;
  outputFormat?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
  };
}

export interface GenerateSpeechResponse {
  success: boolean;
  audioUrl: string;
  audioPath?: string;
  filename: string;
  duration: number;
  text: string;
  voiceId: string;
  accent?: string;
  isLocalClone?: boolean; // NEW: Indicates if local clone was used
  timestamp: string;
}

export interface VoicesResponse {
  success: boolean;
  voices: {
    default: Voice[];
    custom: CustomVoice[];
  };
  count: number;
}

export interface VoiceResponse {
  success: boolean;
  voice: Voice;
}

export interface CustomVoice {
  id: string;
  user_id: string;
  voice_id: string;
  voice_name: string;
  sample_file_path: string;
  accent?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  isCustom: true;
  isLocalClone?: boolean; // NEW: Indicates if stored locally
}

export interface AudioHistoryItem {
  id: string;
  user_id: string;
  voice_id: string;
  voice_name: string;
  accent?: string; // NEW: Accent used for generation
  text: string;
  audio_file_path: string;
  duration_seconds: number;
  file_size_bytes: number;
  metadata?: {
    accent?: string;
    model_id?: string;
    isLocalClone?: boolean;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface AudioHistoryResponse {
  success: boolean;
  total: number;
  history: AudioHistoryItem[];
}

export interface CustomVoicesResponse {
  success: boolean;
  voices: CustomVoice[];
}

export interface HealthResponse {
  status: string;
  message: string;
  apiKey: boolean;
}

import { authService } from './authService';

const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const base = rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';

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

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${base}/api/voice-cloning/health`);
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function cloneVoice(payload: CloneVoiceRequest): Promise<CloneVoiceResponse> {
  const formData = new FormData();
  formData.append('audio', payload.audio);
  formData.append('voiceName', payload.voiceName);
  formData.append('accent', payload.accent); // REQUIRED - Must include accent
  if (payload.description) {
    formData.append('description', payload.description);
  }

  const res = await fetch(`${base}/api/voice-cloning/clone`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function generateSpeech(payload: GenerateSpeechRequest & { voiceName?: string }): Promise<GenerateSpeechResponse> {
  const res = await fetch(`${base}/api/voice-cloning/generate`, {
    method: 'POST',
    headers: getAuthHeadersWithJSON(),
    body: JSON.stringify({
      text: payload.text,
      voiceId: payload.voiceId,
      accent: payload.accent, // REQUIRED - Must include accent
      voiceName: payload.voiceName,
      modelId: payload.modelId || 'eleven_multilingual_v2',
      outputFormat: payload.outputFormat || 'mp3_44100_128',
      voiceSettings: payload.voiceSettings || {
        stability: 0.5,
        similarity_boost: 0.75
      }
    }),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function getVoices(): Promise<VoicesResponse> {
  const res = await fetch(`${base}/api/voice-cloning/voices`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function getVoice(voiceId: string): Promise<VoiceResponse> {
  const res = await fetch(`${base}/api/voice-cloning/voices/${voiceId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function deleteVoice(voiceId: string): Promise<{ success: boolean; voiceId: string; status: string; timestamp: string }> {
  const res = await fetch(`${base}/api/voice-cloning/voices/${voiceId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

/**
 * Get user's audio generation history
 */
export async function getAudioHistory(limit: number = 20, offset: number = 0): Promise<AudioHistoryResponse> {
  const res = await fetch(`${base}/api/voice-cloning/user/audio-history?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function deleteGeneratedAudio(id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`${base}/api/voice-cloning/user/audio-history/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

/**
 * Get user's custom voice clones
 */
export async function getCustomVoices(): Promise<CustomVoicesResponse> {
  const res = await fetch(`${base}/api/voice-cloning/user/custom-voices`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export async function playAudio(audioUrl: string): Promise<{ success: boolean; status: string; audioUrl: string; timestamp: string }> {
  const res = await fetch(`${base}/api/voice-cloning/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioUrl }),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}
