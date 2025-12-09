export type MemoryNodeType = 'person' | 'memory' | 'event' | 'tag' | 'media';

export type LanguageInfo = {
  code: string;
  name: string;
  confidence?: number;
  isRTL?: boolean;
};

export type GraphNode = { id: string; label: string; type: MemoryNodeType; data: Record<string, unknown> };
export type GraphEdge = { source: string; target: string; label: string };
export type GraphResponse = { nodes: GraphNode[]; edges: GraphEdge[]; count: number };

export type SearchResponse = {
  ids: string[][];
  documents: string[][];
  metadatas: Record<string, unknown>[][];
  distances?: number[][];
  embeddings?: number[][][];
  uris?: string[][];
};

export type CreateMemoryRequest = {
  id?: string;
  document: string;
  person: string;
  event?: string;
  media?: string[];
  tags?: string[];
  extra?: Record<string, unknown>;
  createdAt?: string;
};

export type CreateMemoryResponse = {
  ok: boolean;
  id: string;
  language?: LanguageInfo;
};

export type UpdateMemoryResponse = {
  ok: boolean;
  id: string;
  tags?: string[];
  language?: LanguageInfo;
};

import { authService } from './authService';

const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
// Default to same-origin when not provided so Vite proxy handles '/api' in dev
const base = rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';

function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function createMemory(payload: CreateMemoryRequest) {
  const res = await fetch(`${base}/api/memory-graph/memories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json() as Promise<CreateMemoryResponse>;
}

export async function addTags(memoryId: string, tags: string[]) {
  const res = await fetch(`${base}/api/memory-graph/memories/${encodeURIComponent(memoryId)}/tags`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ tags }),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json() as Promise<UpdateMemoryResponse>;
}

export async function updateMemory(
  memoryId: string,
  payload: { tags?: string[]; document?: string; metadata?: Record<string, unknown> }
) {
  const res = await fetch(`${base}/api/memory-graph/memories/${encodeURIComponent(memoryId)}/tags`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json() as Promise<UpdateMemoryResponse>;
}

export async function deleteMemory(memoryId: string) {
  const res = await fetch(`${base}/api/memory-graph/memories/${encodeURIComponent(memoryId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json() as Promise<{ ok: boolean; id: string }>;
}

export async function searchMemories(params: { q: string; n?: number; person?: string; event?: string; tag?: string }) {
  const usp = new URLSearchParams();
  usp.set('q', params.q);
  if (params.n) usp.set('n', String(params.n));
  if (params.person) usp.set('person', params.person);
  if (params.event) usp.set('event', params.event);
  if (params.tag) usp.set('tag', params.tag);
  const res = await fetch(`${base}/api/memory-graph/memories/search?${usp.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json() as Promise<SearchResponse>;
}

export async function getGraph(seed: string, n: number) {
  const usp = new URLSearchParams({ seed, n: String(n) });
  const res = await fetch(`${base}/api/memory-graph/graph?${usp.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json() as Promise<GraphResponse>;
}

export async function uploadMedia(files: File[]) {
  const token = authService.getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const form = new FormData();
  for (const file of files) form.append('files', file);
  const res = await fetch(`${base}/api/memory-graph/media/upload`, { 
    method: 'POST', 
    headers,
    body: form 
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json() as Promise<{ ok: boolean; files: Array<{ filename: string; mimetype: string; size: number; path: string }> }>;
}

export async function bulkDeleteMemories(ids: string[]) {
  const res = await fetch(`${base}/api/chroma/collections/memory-graph/delete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json() as Promise<{ ok: boolean; deleted: number }>;
}


