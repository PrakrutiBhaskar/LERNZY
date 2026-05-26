import { STORAGE_KEYS } from '../utils/constants';
import { getItem, setItem, removeItem } from '../utils/storage';
import { BACKEND_BASE_URL } from '../utils/config';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
  educationLevel?: string;
  points: number;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Global in-memory auth state
let currentAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const listeners = new Set<(state: AuthState) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...currentAuthState }));
}

// Initialize state from storage on import
export async function initializeAuth(): Promise<AuthState> {
  try {
    const accessToken = await getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    // Parse user profile if exists
    const userStr = await getItem(STORAGE_KEYS.USER_PROFILE);
    const user = userStr ? JSON.parse(userStr) : null;

    currentAuthState = {
      accessToken,
      refreshToken,
      user,
      isAuthenticated: !!accessToken,
      isLoading: false,
    };
  } catch (error) {
    console.error('Failed to initialize auth state from storage:', error);
    currentAuthState = {
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
  notifyListeners();
  return currentAuthState;
}

// Subscriptions for React hooks
export function subscribeToAuth(listener: (state: AuthState) => void): () => void {
  listeners.add(listener);
  listener({ ...currentAuthState }); // Initial call
  return () => {
    listeners.delete(listener);
  };
}

export function getAuthState(): AuthState {
  return { ...currentAuthState };
}

// Updates tokens in storage and memory
export async function setAuthTokens(accessToken: string, refreshToken: string, user?: UserProfile) {
  try {
    await setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    
    let updatedUser = currentAuthState.user;
    if (user) {
      await setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
      updatedUser = user;
    }

    currentAuthState = {
      accessToken,
      refreshToken,
      user: updatedUser,
      isAuthenticated: true,
      isLoading: false,
    };
    notifyListeners();
  } catch (error) {
    console.error('Failed to save tokens to storage:', error);
  }
}

// Clears auth session on logout or expiration
export async function clearAuthSession() {
  try {
    await removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await removeItem(STORAGE_KEYS.USER_PROFILE);

    currentAuthState = {
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
    notifyListeners();
  } catch (error) {
    console.error('Failed to clear tokens from storage:', error);
  }
}

// Queue for holding requests while token is refreshing
let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function processQueue(error: any, token: string | null = null) {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
}

/**
 * Perform silent token rotation. Resolves with the new access token.
 */
export async function performTokenRefresh(): Promise<string> {
  const refreshToken = currentAuthState.refreshToken || (await getItem(STORAGE_KEYS.REFRESH_TOKEN));
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const url = `${BACKEND_BASE_URL}/api/v1/auth/refresh`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // 400 validation error, 401 token reuse / expired, etc.
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      // If server invalidates the refresh token (e.g. reuse breach detection)
      // we must revoke the session immediately.
      await clearAuthSession();
      throw new Error(errorData?.message || `Refresh failed with status ${response.status}`);
    }

    const resBody = await response.json();
    const { accessToken: newAccess, refreshToken: newRefresh, user } = resBody.data;

    if (!newAccess || !newRefresh) {
      throw new Error('Refresh response missing tokens');
    }

    await setAuthTokens(newAccess, newRefresh, user);
    return newAccess;
  } catch (error) {
    console.warn('Token refresh failed:', error);
    await clearAuthSession();
    throw error;
  }
}

/**
 * Production-grade Fetch Wrapper.
 * - Appends base URL.
 * - Handles authentication headers.
 * - Handles token rotation and concurrent refresh requests.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = path.startsWith('http') ? path : `${BACKEND_BASE_URL}${path}`;
  
  // 1. Set headers
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 2. Add Authorization token if present
  if (currentAuthState.accessToken) {
    headers.set('Authorization', `Bearer ${currentAuthState.accessToken}`);
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, fetchOptions);

    // 3. Handle 401 Unauthorized (attempt token refresh)
    if (response.status === 401) {
      if (isRefreshing) {
        // Queue this request
        try {
          const newAccessToken = await new Promise<string>((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          });
          
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          return await fetch(url, fetchOptions);
        } catch (queueError) {
          // If refresh queue failed, return original 401 response
          return response;
        }
      }

      isRefreshing = true;

      try {
        const newAccessToken = await performTokenRefresh();
        isRefreshing = false;
        processQueue(null, newAccessToken);

        // Retry original request
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        response = await fetch(url, fetchOptions);
        return response;
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        // Refresh failed (and user logged out), return original 401 response
        return response;
      }
    }

    return response;
  } catch (networkError) {
    // If request fails due to lack of network, propagate it
    throw networkError;
  }
}

/**
 * Uploads a file from the device to the server using multipart/form-data.
 */
export async function uploadFile(
  path: string,
  fileUri: string,
  mimeType: string,
  fileName: string,
  extraData: Record<string, string> = {}
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${BACKEND_BASE_URL}${path}`;
  const formData = new FormData();

  formData.append('file', {
    uri: fileUri,
    type: mimeType,
    name: fileName,
  } as any);

  Object.entries(extraData).forEach(([key, val]) => {
    formData.append(key, val);
  });

  const headers = new Headers();
  if (currentAuthState.accessToken) {
    headers.set('Authorization', `Bearer ${currentAuthState.accessToken}`);
  }

  return await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
}

// Initial initialization
initializeAuth();
