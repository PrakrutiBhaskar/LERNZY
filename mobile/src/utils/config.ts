/**
 * Read-only, environment-derived, pure configuration constants for the LERNZY app.
 */

/**
 * Indicates whether the app is running in a development environment.
 */
export const IS_DEV = __DEV__;

/**
 * Base URL of the CDN where the offline model weights can be downloaded.
 * Tries EXPO_PUBLIC_ prefix first (since Metro exposes these in bundles)
 * and falls back to standard process.env.
 */
export const MODEL_CDN_BASE_URL = 
  process.env.EXPO_PUBLIC_MODEL_CDN_BASE_URL || 
  process.env.MODEL_CDN_BASE_URL || 
  '';
