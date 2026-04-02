import React from 'react';

interface FootDiagramProps {
  selectedZones: string[];
  onToggleZone: (zone: string) => void;
}

const FootDiagram: React.FC<FootDiagramProps> = ({ selectedZones, onToggleZone }) => {
  const zones = [
    { id: 'toe', label: 'Toe', cx: 100, cy: 40, rx: 45, ry: 25 },
    { id: 'ball', label: 'Ball', cx: 100, cy: 90, rx: 50, ry: 30 },
    { id: 'arch', label: 'Arch', cx: 100, cy: 155, rx: 40, ry: 40 },
    { id: 'heel', label: 'Heel', cx: 100, cy: 230, rx: 42, ry: 35 },
  ];

  return (
    <svg viewBox="0 0 200 280" className="w-48 h-64 mx-auto">
      {/* Foot outline */}
      <ellipse cx="100" cy="140" rx="65" ry="130" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
      {zones.map(zone => {
        const selected = selectedZones.includes(zone.id);
        return (
          <g key={zone.id} onClick={() => onToggleZone(zone.id)} className="cursor-pointer">
            <ellipse
              cx={zone.cx}
              cy={zone.cy}
              rx={zone.rx}
              ry={zone.ry}
              fill={selected ? 'hsla(0, 72%, 51%, 0.3)' : 'hsla(var(--primary), 0.1)'}
              stroke={selected ? 'hsl(var(--grade-danger))' : 'hsl(var(--primary))'}
              strokeWidth="1.5"
              className="transition-colors"
            />
            <text x={zone.cx} y={zone.cy + 4} textAnchor="middle" className="text-xs fill-foreground font-medium pointer-events-none">
              {zone.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default FootDiagram;
