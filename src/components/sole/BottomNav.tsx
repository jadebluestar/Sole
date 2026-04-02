import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { Home, Camera, Clock, ClipboardCheck, Heart } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();

  const items = [
    { path: '/dashboard', icon: Home, label: t('home') },
    { path: '/history', icon: Clock, label: t('history') },
    { path: '/scan', icon: Camera, label: t('scan'), highlight: true },
    { path: '/checkin', icon: ClipboardCheck, label: t('checkin') },
    { path: '/care', icon: Heart, label: t('caregiver') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 medical-shadow">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                item.highlight
                  ? 'relative -mt-4'
                  : ''
              } ${active && !item.highlight ? 'text-primary' : 'text-text-muted hover:text-foreground'}`}
            >
              {item.highlight ? (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  active ? 'bg-primary text-primary-foreground' : 'bg-primary/90 text-primary-foreground'
                } medical-shadow-lg`}>
                  <item.icon size={22} />
                </div>
              ) : (
                <item.icon size={20} />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
