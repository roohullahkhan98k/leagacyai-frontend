import { authService } from './authService';

const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const base = rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';
if (!base) {
  throw new Error('VITE_BACKEND_URL environment variable is required');
}
const API_BASE_URL = base;

export interface QAPair {
  question: string;
  answer: string;
  timestamp: string;
}

export interface Interview {
  id: string;
  session_id: string;
  user_id?: string;
  title: string;
  status: 'active' | 'completed';
  qa_pairs: QAPair[];
  total_qa: number;
  started_at: string;
  ended_at?: string;
}

export interface StartInterviewRequest {
  session_id: string;
  user_id?: string;
}

export interface StartInterviewResponse {
  success: boolean;
  interview_id: string;
}

export interface AddQARequest {
  session_id: string;
  question: string;
  answer: string;
}

export interface AddQAResponse {
  success: boolean;
  total_qa: number;
}

export interface EndInterviewRequest {
  session_id: string;
  title?: string;
}

export interface EndInterviewResponse {
  success: boolean;
  interview: Interview;
}

export interface GetInterviewResponse {
  success: boolean;
  interview: Interview;
}

export interface GetUserInterviewsResponse {
  success: boolean;
  interviews: Interview[];
}

export interface SearchSimilarQARequest {
  query: string;
  limit?: number;
}

export interface SimilarQAResult {
  question: string;
  answer: string;
  interview_id: string;
  similarity: number;
}

export interface SearchSimilarQAResponse {
  success: boolean;
  results: SimilarQAResult[];
}

export interface DeleteInterviewResponse {
  success: boolean;
  message: string;
}

class InterviewApi {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Start a new interview session
   */
  async startInterview(sessionId: string, userId?: string): Promise<StartInterviewResponse> {
    return this.fetchWithAuth('/api/interview/start', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
      }),
    });
  }

  /**
   * Add a Q&A pair to the current interview
   */
  async addQAPair(sessionId: string, question: string, answer: string): Promise<AddQAResponse> {
    return this.fetchWithAuth('/api/interview/qa', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        question,
        answer,
      }),
    });
  }

  /**
   * End the interview session
   */
  async endInterview(sessionId: string, title?: string): Promise<EndInterviewResponse> {
    return this.fetchWithAuth('/api/interview/end', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        title,
      }),
    });
  }

  /**
   * Get a specific interview by session ID
   */
  async getInterview(sessionId: string): Promise<GetInterviewResponse> {
    return this.fetchWithAuth(`/api/interview/${sessionId}`);
  }

  /**
   * Get all interviews for a specific user
   */
  async getUserInterviews(userId: string): Promise<GetUserInterviewsResponse> {
    return this.fetchWithAuth(`/api/interview/user/${userId}`);
  }

  /**
   * Search for similar Q&A pairs using semantic search
   */
  async searchSimilarQA(query: string, limit: number = 5): Promise<SearchSimilarQAResponse> {
    return this.fetchWithAuth('/api/interview/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        limit,
      }),
    });
  }

  /**
   * Delete an interview by session ID
   */
  async deleteInterview(sessionId: string): Promise<DeleteInterviewResponse> {
    return this.fetchWithAuth(`/api/interview/${sessionId}`, {
      method: 'DELETE',
    });
  }
}

export const interviewApi = new InterviewApi();

