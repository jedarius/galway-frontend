'use client';

import { User, AuthState } from './types';
import { create } from 'zustand';

// Mock user data for demo
const mockUser: User = {
  username: 'test_operative',
  role: 'operative',
  onset: '05/16/2025',
  idNo: '582491',
  bio: 'Researching quantum botany and temporal leaf patterns 🌱...'
};

interface AuthStore extends AuthState {
  cartItemCount: number;  // ← Add this
  toggleAuth: () => void;
  login: (user: User) => void;
  logout: () => void;
  addToCart: () => void;     // ← Add this
  removeFromCart: () => void; // ← Add this
  clearCart: () => void;     // ← Add this
}

export const useAuth = create<AuthStore>((set) => ({
  isLoggedIn: false,
  user: null,
  cartItemCount: 0,  // ← Add this
  
  toggleAuth: () => set((state) => ({
    isLoggedIn: !state.isLoggedIn,
    user: !state.isLoggedIn ? mockUser : null
  })),
  
  login: (user: User) => set({
    isLoggedIn: true,
    user
  }),
  
  logout: () => set({
    isLoggedIn: false,
    user: null,
    cartItemCount: 0  // Clear cart on logout
  }),

  addToCart: () => set((state) => ({
    cartItemCount: state.cartItemCount + 1
  })),

  removeFromCart: () => set((state) => ({
    cartItemCount: Math.max(0, state.cartItemCount - 1)
  })),

  clearCart: () => set({
    cartItemCount: 0
  }),
}));