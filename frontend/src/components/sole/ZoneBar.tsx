import React from 'react';
import { getRiskBgColor } from '@/lib/mockData';

interface ZoneBarProps {
  label: string;
  score: number;
  change?: number;
}

const ZoneBar: React.FC<ZoneBarProps> = ({ label, score, change }) => {
  const barColor = getRiskBgColor(score);
  const changeText = change === undefined || change === 0 ? 'stable' :
    change > 0 ? `↑${Math.abs(change)}%` : `↓${Math.abs(change)}%`;
  const changeColor = change === undefined || change === 0 ? 'text-text-muted' :
    change > 0 ? 'text-grade-danger' : 'text-grade-safe';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium w-12 text-foreground">{label}</span>
      <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold w-8 text-right text-foreground">{score}</span>
      {change !== undefined && (
        <span className={`text-xs w-14 text-right ${changeColor}`}>{changeText}</span>
      )}
    </div>
  );
};

export default ZoneBar;
