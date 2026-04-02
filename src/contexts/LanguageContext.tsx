import React, { createContext, useContext, useState, useCallback } from 'react';
import T, { type Lang } from '@/lib/translations';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('en');
  const toggleLang = useCallback(() => setLang(l => l === 'en' ? 'hi' : 'en'), []);
  const t = useCallback((key: string) => T[lang]?.[key] ?? T['en']?.[key] ?? key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
