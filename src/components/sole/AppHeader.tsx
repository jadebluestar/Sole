import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, LogOut, Shield } from 'lucide-react';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack }) => {
  const { lang, toggleLang } = useLang();
  const { dark, toggleTheme } = useTheme();
  const { logout, patient } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border medical-shadow">
      <div className="flex items-center justify-between h-14 px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-foreground mr-1">
              ←
            </button>
          )}
          <span className="text-lg font-bold text-primary">Sole</span>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Shield size={10} />
            AES-256
          </span>
        </div>
        {title && <span className="text-sm font-semibold text-foreground absolute left-1/2 -translate-x-1/2">{title}</span>}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="text-xs font-medium px-2 py-1 rounded-pill border border-border hover:bg-secondary transition-colors text-foreground"
          >
            {lang === 'en' ? 'EN' : 'हि'} | {lang === 'en' ? 'हि' : 'EN'}
          </button>
          <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-foreground">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {patient && (
            <button onClick={() => { logout(); navigate('/'); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-text-secondary">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
