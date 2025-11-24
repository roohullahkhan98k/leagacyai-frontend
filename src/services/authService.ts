import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

const rawBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const base = rawBackendUrl ? String(rawBackendUrl).replace(/\/$/, '') : '';
const API_BASE_URL = base ? `${base}/api/auth` : '/api/auth';

class AuthService {
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const formData = new FormData();
      
      formData.append('email', userData.email);
      formData.append('username', userData.username);
      formData.append('password', userData.password);
      
      if (userData.firstName) {
        formData.append('firstName', userData.firstName);
      }
      
      if (userData.lastName) {
        formData.append('lastName', userData.lastName);
      }
      
      if (userData.profilePicture) {
        formData.append('profilePicture', userData.profilePicture);
      }

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend server is running.');
      }
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend server is running.');
      }
      throw error;
    }
  }

  // Token management
  setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
