import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, LanguageCode, SUPPORTED_LANGUAGES } from '../utils/constants';
import { getItem, setItem } from '../utils/storage';
import { TRANSLATIONS, TranslationKey } from './translations';

interface LanguageContextProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: TranslationKey) => string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadLanguage() {
      try {
        const stored = await getItem(STORAGE_KEYS.SELECTED_LANGUAGE);
        if (stored && (stored === 'en' || stored === 'hi' || stored === 'kn')) {
          setLanguageState(stored as LanguageCode);
        }
      } catch (error) {
        console.error('Failed to load selected language:', error);
      } finally {
        setIsReady(true);
      }
    }
    loadLanguage();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    try {
      await setItem(STORAGE_KEYS.SELECTED_LANGUAGE, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save selected language:', error);
    }
  };

  const t = (key: TranslationKey): string => {
    const dict = (TRANSLATIONS[language] || TRANSLATIONS.en) as Partial<typeof TRANSLATIONS.en>;
    return dict[key] || TRANSLATIONS.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export context for use in useTheme
export { LanguageContext };
