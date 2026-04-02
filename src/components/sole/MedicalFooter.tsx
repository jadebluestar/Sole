import React from 'react';
import { useLang } from '@/contexts/LanguageContext';

const MedicalFooter: React.FC = () => {
  const { t } = useLang();
  return (
    <footer className="px-4 py-6 text-center border-t border-border mt-8">
      <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
        {t('footer_disclaimer')}
      </p>
    </footer>
  );
};

export default MedicalFooter;
