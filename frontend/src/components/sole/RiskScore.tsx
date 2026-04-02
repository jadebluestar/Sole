import React from 'react';
import { getRiskColor } from '@/lib/mockData';

interface RiskScoreProps {
  score: number;
  size?: 'sm' | 'lg';
}

const RiskScore: React.FC<RiskScoreProps> = ({ score, size = 'lg' }) => {
  const colorClass = getRiskColor(score);
  return (
    <span className={`font-bold ${colorClass} ${size === 'lg' ? 'text-4xl' : 'text-2xl'}`}>
      {score}
    </span>
  );
};

export default RiskScore;
