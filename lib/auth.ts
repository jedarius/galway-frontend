// lib/auth.ts - Updated with backend integration
import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'guest' | 'operative' | 'contributor' | 'beta-tester' | 'moderator' | 'admin';
  onset: string;
  idNo: string;
  bio: string;
  isEmailVerified: boolean;
  phone?: string;
  birthday?: string;
  country?: string;
  city?: string;
  oliveBranch?: {
    id: string;
    svg: string;
    colors: {
      olive: string;
      branch: string;
      leaf: string;
    };
    oliveCount: number;
    oliveType: string;
    rarity: {
      count: string;
      type: string;
      countPercentage: number;
      typePercentage: number;
    };
    botanicalId: string;
  };
  createdAt: string;
  lastLogin?: string;
}

interface AuthState {
  // User state
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // Cart state (demo functionality)
  cartItemCount: number;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  
  // Demo actions (remove in production)
  toggleAuth: () => void;
  addToCart: () => void;
  clearCart: () => void;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  user?: User;
}

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

// Token management
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('galwayUser');
    localStorage.removeItem('pendingUser');
  }
};

// API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

export const useAuth = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isLoggedIn: false,
  isLoading: false,
  cartItemCount: 0,

  // Login function
  login: async (credentials: LoginCredentials): Promise<AuthResult> => {
    set({ isLoading: true });

    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Store auth token
      if (data.token) {
        setAuthToken(data.token);
      }

      // Update user state
      const user: User = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role || 'operative',
        onset: data.user.onset || new Date().toLocaleDateString(),
        idNo: data.user.idNo,
        bio: data.user.bio || '',
        isEmailVerified: data.user.isEmailVerified || false,
        phone: data.user.phone,
        birthday: data.user.birthday,
        country: data.user.country,
        city: data.user.city,
        oliveBranch: data.user.oliveBranch,
        createdAt: data.user.createdAt,
        lastLogin: new Date().toISOString(),
      };

      // Store user data locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('galwayUser', JSON.stringify(user));
      }

      set({ 
        user, 
        isLoggedIn: true, 
        isLoading: false 
      });

      return { success: true, user };

    } catch (error) {
      set({ isLoading: false });
      console.error('Login error:', error);
      
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  },

  // Logout function
  logout: () => {
    removeAuthToken();
    set({ 
      user: null, 
      isLoggedIn: false,
      cartItemCount: 0
    });
  },

  // Refresh user data
  refreshUser: async () => {
    const token = getAuthToken();
    if (!token) return;

    set({ isLoading: true });

    try {
      const data = await apiCall('/auth/me');
      
      const user: User = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role || 'operative',
        onset: data.user.onset || new Date().toLocaleDateString(),
        idNo: data.user.idNo,
        bio: data.user.bio || '',
        isEmailVerified: data.user.isEmailVerified || false,
        phone: data.user.phone,
        birthday: data.user.birthday,
        country: data.user.country,
        city: data.user.city,
        oliveBranch: data.user.oliveBranch,
        createdAt: data.user.createdAt,
        lastLogin: data.user.lastLogin,
      };

      // Update stored user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('galwayUser', JSON.stringify(user));
      }

      set({ 
        user, 
        isLoggedIn: true, 
        isLoading: false 
      });

    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Token might be expired, logout
      get().logout();
    }
  },

  // Demo functions (remove in production)
  toggleAuth: () => {
    const { isLoggedIn } = get();
    
    if (isLoggedIn) {
      get().logout();
    } else {
      // Mock login for demo
      const mockUser: User = {
        id: 'demo-user-123',
        username: 'demo_operative',
        email: 'demo@galwayresearch.org',
        role: 'operative',
        onset: '08/31/2025',
        idNo: '445782',
        bio: 'Demo account for testing the Galway Research Institute platform and its various features.',
        isEmailVerified: true,
        oliveBranch: {
          id: 'demo-branch-456',
          svg: `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="70" height="70" fill="#f5f5f4"/>
            <rect x="33" y="20" width="4" height="30" fill="#8B7355"/>
            <rect x="24" y="27" width="12" height="4" fill="#8B7355"/>
            <rect x="34" y="37" width="12" height="4" fill="#8B7355"/>
            <rect x="24" y="44" width="12" height="4" fill="#8B7355"/>
            <rect x="18" y="25" width="8" height="4" fill="#228B22"/>
            <rect x="20" y="29" width="8" height="4" fill="#228B22"/>
            <rect x="42" y="35" width="8" height="4" fill="#228B22"/>
            <rect x="44" y="39" width="8" height="4" fill="#228B22"/>
            <rect x="18" y="42" width="8" height="4" fill="#228B22"/>
            <rect x="20" y="46" width="8" height="4" fill="#228B22"/>
            <rect x="20" y="32" width="4" height="4" fill="#6B8E23"/>
            <rect x="40" y="42" width="4" height="4" fill="#6B8E23"/>
            <rect x="26" y="49" width="4" height="4" fill="#6B8E23"/>
          </svg>`,
          colors: {
            olive: '#6B8E23',
            branch: '#8B7355',
            leaf: '#228B22'
          },
          oliveCount: 3,
          oliveType: 'Green Olives',
          rarity: {
            count: 'Uncommon',
            type: 'Common',
            countPercentage: 19,
            typePercentage: 30
          },
          botanicalId: 'OLV-ABC123'
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('galwayUser', JSON.stringify(mockUser));
      }

      set({ 
        user: mockUser, 
        isLoggedIn: true 
      });
    }
  },

  addToCart: () => {
    set((state) => ({ 
      cartItemCount: state.cartItemCount + 1 
    }));
  },

  clearCart: () => {
    set({ cartItemCount: 0 });
  },
}));

// Initialize auth state from localStorage on app start
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('galwayUser');
  const token = getAuthToken();
  
  if (storedUser && token) {
    try {
      const user = JSON.parse(storedUser);
      useAuth.setState({ 
        user, 
        isLoggedIn: true 
      });
      
      // Optionally refresh user data from backend
      useAuth.getState().refreshUser();
    } catch (error) {
      console.error('Failed to restore auth state:', error);
      removeAuthToken();
    }
  }
}

// Export auth utilities
export { getAuthToken, setAuthToken, removeAuthToken, apiCall };

// Helper function for protected routes
export const requireAuth = (callback: () => void) => {
  const { isLoggedIn } = useAuth.getState();
  
  if (isLoggedIn) {
    callback();
  } else {
    // Redirect to login or show auth modal
    window.location.href = '/login';
  }
};

export default useAuth;