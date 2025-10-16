import { projectId, publicAnonKey } from './supabase/info';

// Base API configuration
// Use local mock backend during development when running on localhost
const LOCAL_DEV_URL = 'http://localhost:54321/make-server-5695837e';
const REMOTE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5695837e`;
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? LOCAL_DEV_URL : REMOTE_URL;

/*
 * WISION API CLIENT
 * 
 * Current State: Demo Mode
 * - Daily challenges work via backend (public endpoint)
 * - Challenge submissions use local logic (no auth required)
 * - User profiles stored in localStorage only
 * - Creative Lab discoveries use local logic
 * 
 * For Full Backend Integration:
 * - Implement user registration/login flow
 * - Store session tokens and handle authentication
 * - Enable backend submission for challenges and discoveries
 * - Sync user profiles with backend database
 */

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  details?: string;
  [key: string]: any;
}

// API client class
export class WisionAPI {
  private accessToken: string | null = null;

  constructor() {
    // Try to get existing session token from localStorage (guard for SSR)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedToken = localStorage.getItem('wision-access-token');
      if (savedToken) {
        this.accessToken = savedToken;
      }
    }
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`API ${response.status} error for ${endpoint}:`, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`API request failed for ${endpoint}:`, error);
      // Don't throw error, let calling code handle gracefully
      throw error;
    }
  }

  // Authentication methods
  async register(email: string, password: string, profile: any): Promise<ApiResponse> {
    const response = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, profile }),
    });

    if (response.success && response.user) {
      // For now, we'll use a dummy token since we're focusing on the KV store
      // In a full implementation, you'd get the session token from the response
      const token = 'demo-token';
      this.accessToken = token;
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('wision-access-token', token);
      }
    }

    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.session) {
      const token = response.session?.access_token as string | undefined;
      if (token) {
        this.accessToken = token;
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('wision-access-token', token);
        }
      }
    }

    return response;
  }

  async logout(): Promise<void> {
    this.accessToken = null;
    localStorage.removeItem('wision-access-token');
  }

  // Profile methods
  async getProfile(): Promise<any> {
    return await this.request('/users/profile');
  }

  async updateProfile(profile: any): Promise<ApiResponse> {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Character database methods
  async getCharacters(filters?: { category?: string; difficulty?: number }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/characters${query}`);
  }

  async getRandomCharacters(count: number = 1, difficulty?: number): Promise<any> {
    const params = new URLSearchParams();
    params.append('count', count.toString());
    if (difficulty) params.append('difficulty', difficulty.toString());
    
    return await this.request(`/characters/random?${params.toString()}`);
  }

  // Daily challenge methods
  async getDailyChallenge(): Promise<any> {
    return await this.request('/challenges/daily');
  }

  async submitChallenge(challengeId: string, answer: string, challengeDate: string): Promise<ApiResponse> {
    return await this.request('/challenges/submit', {
      method: 'POST',
      body: JSON.stringify({ challengeId, answer, challengeDate }),
    });
  }

  // Discovery methods (Creative Lab)
  async recordDiscovery(character: string, radicals: string[], method: string = 'creative_lab'): Promise<ApiResponse> {
    return await this.request('/discoveries', {
      method: 'POST',
      body: JSON.stringify({ character, radicals, method }),
    });
  }

  async getDiscoveries(): Promise<any> {
    return await this.request('/discoveries');
  }

  // Leaderboard methods
  async getLeaderboard(type: 'score' | 'discoveries' | 'streak' = 'score', limit: number = 10): Promise<any> {
    return await this.request(`/leaderboard?type=${type}&limit=${limit}`);
  }

  // Analytics methods
  async getProgressAnalytics(): Promise<any> {
    return await this.request('/analytics/progress');
  }

  // Health check
  async healthCheck(): Promise<any> {
    return await this.request('/health');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Create singleton instance
export const api = new WisionAPI();

// Convenience functions for common operations
export const apiHelpers = {
  // Sync user profile from localStorage to backend
  async syncProfile(localProfile: any): Promise<boolean> {
    try {
      // For now, we'll skip backend sync since we don't have user auth set up
      // In a full implementation, this would sync to the backend
      console.log('Skipping backend profile sync (no authentication set up yet)');
      return true; // Return true to indicate "success" for local mode
    } catch (error) {
      console.error('Failed to sync profile:', error);
      return false;
    }
  },

  // Get or create daily challenge
  async getTodaysChallenge(): Promise<any> {
    try {
      // Try to get challenge from backend (this should work as it's a public endpoint)
      const response = await api.getDailyChallenge();
      return response.challenge;
    } catch (error) {
      console.warn('Backend unavailable, using local challenge:', error);
      
      // Generate a local fallback challenge that changes daily
      const today = new Date().toISOString().split('T')[0];
      const localChallenges = [
        {
          character: '桌',
          pronunciation: 'zhuō',
          meaning: 'table',
          acceptableMeanings: ['table', 'desk'],
          level: 'moderate',
          radicals: [
            { character: '木', meaning: 'wood, tree' },
            { character: '卓', meaning: 'tall, prominent, outstanding' }
          ],
          hint: 'This furniture piece is made from wood and stands at a height for people to work or eat at.',
          description: 'Look at the character above and the radical meanings below. What English word describes this object?',
          points: 50
        },
        {
          character: '明',
          pronunciation: 'míng',
          meaning: 'bright',
          acceptableMeanings: ['bright', 'brilliant', 'clear'],
          level: 'moderate',
          radicals: [
            { character: '日', meaning: 'sun' },
            { character: '月', meaning: 'moon' }
          ],
          hint: 'When the sun and moon come together, they create complete illumination.',
          description: 'This character combines celestial bodies to represent illumination. What does it mean?',
          points: 50
        },
        {
          character: '森',
          pronunciation: 'sēn',
          meaning: 'forest',
          acceptableMeanings: ['forest', 'woods'],
          level: 'easy',
          radicals: [
            { character: '木', meaning: 'wood, tree' },
            { character: '木', meaning: 'wood, tree' },
            { character: '木', meaning: 'wood, tree' }
          ],
          hint: 'When many trees grow together in one place, what do they create?',
          description: 'Three trees coming together form this natural environment. What is it?',
          points: 30
        },
        {
          character: '休',
          pronunciation: 'xiū',
          meaning: 'rest',
          acceptableMeanings: ['rest', 'relax'],
          level: 'moderate',
          radicals: [
            { character: '人', meaning: 'person' },
            { character: '木', meaning: 'wood, tree' }
          ],
          hint: 'A tired person leans against a tree for comfort.',
          description: 'What does a person do when they lean against a tree after a long day?',
          points: 40
        }
      ];
      
      // Use date to pick consistent daily challenge
      const dateNum = new Date(today).getTime();
      const challengeIndex = Math.floor((dateNum / (24 * 60 * 60 * 1000)) % localChallenges.length);
      
      return localChallenges[challengeIndex];
    }
  },

  // Submit challenge with error handling
  async submitTodaysChallenge(answer: string): Promise<{ success: boolean; isCorrect?: boolean; pointsEarned?: number; explanation?: string }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const challenge = await apiHelpers.getTodaysChallenge();
      
      if (!challenge) {
        return { success: false };
      }

      // For now, we'll fallback to local logic since we don't have user auth set up
      // In a full implementation, this would submit to the backend
      console.log('Using local challenge logic (no authentication set up yet)');
      
      // Fallback to local challenge logic
      const isCorrect = challenge.acceptableMeanings?.some((meaning: string) => 
        meaning.toLowerCase() === answer.toLowerCase().trim()
      ) || false;
      
      const pointsEarned = isCorrect ? 25 : 5;
      
      return {
        success: true,
        isCorrect,
        pointsEarned,
        explanation: isCorrect 
          ? `Correct! ${challenge.character} (${challenge.pronunciation}) means "${challenge.meaning}"`
          : `The correct answer is "${challenge.meaning}". ${challenge.character} (${challenge.pronunciation}) means "${challenge.meaning}"`
      };
    } catch (error) {
      console.warn('Challenge submission error:', error);
      
      // Fallback to local challenge logic
      const challenge = await apiHelpers.getTodaysChallenge();
      const isCorrect = challenge.acceptableMeanings?.some((meaning: string) => 
        meaning.toLowerCase() === answer.toLowerCase().trim()
      ) || false;
      
      const pointsEarned = isCorrect ? 25 : 5;
      
      return {
        success: true,
        isCorrect,
        pointsEarned,
        explanation: isCorrect 
          ? `Correct! ${challenge.character} (${challenge.pronunciation}) means "${challenge.meaning}"`
          : `The correct answer is "${challenge.meaning}". ${challenge.character} (${challenge.pronunciation}) means "${challenge.meaning}"`
      };
    }
  },

  // Record Creative Lab discovery
  async recordCreativeDiscovery(character: string, radicals: string[]): Promise<{ success: boolean; isNew: boolean; pointsEarned: number }> {
    try {
      // For now, we'll use local logic since we don't have user auth set up
      // In a full implementation, this would submit to the backend
      console.log('Using local discovery logic (no authentication set up yet)');
      
      // Local fallback - assume it's a new discovery and give points
      const pointsEarned = radicals.length * 10;
      return { 
        success: true, 
        isNew: true, 
        pointsEarned 
      };
    } catch (error) {
      console.warn('Discovery recording error:', error);
      
      // Local fallback - assume it's a new discovery and give points
      const pointsEarned = radicals.length * 10;
      return { 
        success: true, 
        isNew: true, 
        pointsEarned 
      };
    }
  }
};

export default api;