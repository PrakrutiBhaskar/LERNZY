import * as FileSystem from 'expo-file-system';

/**
 * Supported UI and learning languages with codes, labels, and fonts.
 */
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', label: 'English', nativeLabel: 'English', fontName: 'NotoSans' },
  hi: { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', fontName: 'NotoSansDevanagari' },
  kn: { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', fontName: 'NotoSansKannada' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Storage keys for AsyncStorage.
 */
export const STORAGE_KEYS = {
  ONBOARDING_DONE: 'onboarding_complete',
  SELECTED_LANGUAGE: 'lernzy:selected_language',
  MODELS_READY: 'models_ready',
  STUDENT_PROFILE: 'lernzy:student_profile',
} as const;

/**
 * Local file names for the downloaded AI model weights.
 */
export const MODEL_FILENAMES = {
  LLM: 'phi3_mini_int4.gguf',
  STT: 'whisper_tiny.bin',
  TTS_EN: 'piper_en.onnx',
  TTS_HI: 'piper_hi.onnx',
  TTS_KN: 'piper_kn.onnx',
} as const;

/**
 * Centralized directory paths in on-device storage.
 */
export const FILESYSTEM_PATHS = {
  MODELS_DIR: `${FileSystem.documentDirectory}models/`,
  CONTENT_DIR: `${FileSystem.documentDirectory}content/`,
  AUDIO_CACHE_DIR: `${FileSystem.cacheDirectory}audio/`,
} as const;
