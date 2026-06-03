import { useState, useEffect } from 'react';
import {
  apiFetch,
  clearAuthSession,
  getAuthState,
  setAuthTokens,
  subscribeToAuth,
  UserProfile,
  AuthState,
  performTokenRefresh
} from './api';

/**
 * Authentication service methods.
 */
export const authService = {
  /**
   * Signs up a new student profile on the cloud.
   */
  async signup(payload: {
    name: string;
    email: string;
    password?: string;
    preferredLanguage?: string;
    educationLevel?: 'beginner' | 'intermediate' | 'advanced';
    board?: 'ncert' | 'state';
    grade?: number;
    interests?: string[];
    accessibility?: 'none' | 'sign-preferred';
    locationTier?: 'tier-1' | 'tier-2' | 'tier-3';
  }): Promise<UserProfile> {
    // Generate fallback password if none provided for seamless UX
    const signupData = {
      ...payload,
      password: payload.password || 'LernzyPass123!',
      preferredLanguage: payload.preferredLanguage || 'en',
      educationLevel: payload.educationLevel || 'beginner',
      board: payload.board || 'state',
      grade: payload.grade || 6,
      interests: payload.interests || [],
      accessibility: payload.accessibility || 'none',
      locationTier: payload.locationTier || 'tier-3'
    };

    const response = await apiFetch('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });

    const resBody = await response.json();

    if (!response.ok) {
      throw new Error(resBody.message || 'Signup failed');
    }

    const { accessToken, refreshToken, user } = resBody.data;
    await setAuthTokens(accessToken, refreshToken, user);

    return user;
  },

  /**
   * Logs in a student profile.
   */
  async login(email: string, password?: string): Promise<UserProfile> {
    const loginData = {
      email,
      password: password || 'LernzyPass123!',
    };

    const response = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    const resBody = await response.json();

    if (!response.ok) {
      throw new Error(resBody.message || 'Login failed');
    }

    const { accessToken, refreshToken, user } = resBody.data;
    await setAuthTokens(accessToken, refreshToken, user);

    return user;
  },

  /**
   * Logs out the user from the cloud.
   */
  async logout(): Promise<void> {
    try {
      await apiFetch('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch (e) {
      console.warn('Logout request to server failed, clearing local session anyway.', e);
    } finally {
      await clearAuthSession();
    }
  },

  /**
   * Refreshes the session token manually if needed.
   */
  async refreshSession(): Promise<string> {
    return await performTokenRefresh();
  }
};

/**
 * Custom React hook to consume and react to authentication state updates.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>(getAuthState());

  useEffect(() => {
    const unsubscribe = subscribeToAuth((updatedState) => {
      setState(updatedState);
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    signup: authService.signup,
    login: authService.login,
    logout: authService.logout,
  };
}
