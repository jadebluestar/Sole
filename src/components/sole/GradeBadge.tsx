import React from 'react';
import { getGradeBg } from '@/lib/mockData';
import { useLang } from '@/contexts/LanguageContext';

interface GradeBadgeProps {
  grade: number;
  showLabel?: boolean;
}

const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, showLabel = true }) => {
  const { t } = useLang();
  const labels: Record<number, string> = {
    1: t('grade_1'),
    2: t('grade_2'),
    3: t('grade_3'),
    4: t('grade_4'),
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-pill text-sm font-medium text-primary-foreground ${getGradeBg(grade)}`}>
      {showLabel ? labels[grade] : `Grade ${grade}`}
    </span>
  );
};

export default GradeBadge;
