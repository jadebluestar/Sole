import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import AppHeader from '@/components/sole/AppHeader';
import BottomNav from '@/components/sole/BottomNav';
import SoleAssistant from '@/components/sole/SoleAssistant';
import MedicalFooter from '@/components/sole/MedicalFooter';
import GradeBadge from '@/components/sole/GradeBadge';
import ZoneBar from '@/components/sole/ZoneBar';
import { DEMO_SCANS, getRiskColor } from '@/lib/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';

const History: React.FC = () => {
  const { t } = useLang();
  const [filter, setFilter] = useState<'7D' | '30D' | 'All'>('All');
  const [expandedScan, setExpandedScan] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const filteredScans = DEMO_SCANS.filter(s => {
    if (filter === 'All') return true;
    const days = filter === '7D' ? 7 : 30;
    return (Date.now() - new Date(s.timestamp).getTime()) < days * 86400000;
  });

  const chartData = filteredScans.map(s => ({
    date: new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    heel: s.heel, ball: s.ball, arch: s.arch, toe: s.toe,
  }));

  // Weekly summary (simplified)
  const thisWeekScans = DEMO_SCANS.filter(s => (Date.now() - new Date(s.timestamp).getTime()) < 7 * 86400000);
  const lastWeekScans = DEMO_SCANS.filter(s => {
    const age = Date.now() - new Date(s.timestamp).getTime();
    return age >= 7 * 86400000 && age < 14 * 86400000;
  });
  const thisWeekAvg = thisWeekScans.length ? Math.round(thisWeekScans.reduce((a, s) => a + s.overall_risk, 0) / thisWeekScans.length) : 0;
  const lastWeekAvg = lastWeekScans.length ? Math.round(lastWeekScans.reduce((a, s) => a + s.overall_risk, 0) / lastWeekScans.length) : 0;
  const weekDiff = thisWeekAvg - lastWeekAvg;

  const toggleSelect = (id: string) => {
    if (!compareMode) return;
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]);
  };

  const comp = selected.length === 2 ? selected.map(id => DEMO_SCANS.find(s => s.id === id)!) : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title={t('history')} />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">{t('history')}</h1>
            <span className="text-xs bg-secondary text-text-secondary px-2 py-0.5 rounded-pill font-medium">{DEMO_SCANS.length}</span>
          </div>
          <button onClick={() => { setCompareMode(!compareMode); setSelected([]); }}
            className={`text-xs font-medium px-3 py-1.5 rounded-pill border transition-colors ${compareMode ? 'border-primary bg-accent text-primary' : 'border-border text-text-secondary'}`}>
            {t('compare')}
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {(['7D', '30D', 'All'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-pill text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-text-secondary'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-card p-4 medical-shadow">
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--text-muted))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--text-muted))" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
              <Area y1={0} y2={40} fill="hsla(160,84%,39%,0.05)" />
              <ReferenceLine y={40} stroke="hsl(var(--grade-safe))" strokeDasharray="3" strokeOpacity={0.4} />
              <ReferenceLine y={70} stroke="hsl(var(--grade-danger))" strokeDasharray="3" strokeOpacity={0.4} />
              <Line type="monotone" dataKey="heel" stroke="#DC2626" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="ball" stroke="#D97706" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="arch" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="toe" stroke="#059669" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full bg-grade-danger" />{t('heel')}</span>
            <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full bg-grade-watch" />{t('ball')}</span>
            <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full" style={{background:'#3B82F6'}} />{t('arch')}</span>
            <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full bg-grade-safe" />{t('toe')}</span>
          </div>
        </div>

        {/* Weekly summary */}
        <div className="bg-card border border-border rounded-card p-4 medical-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-2">{t('this_week_vs_last')}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className={`text-lg font-bold ${weekDiff > 0 ? 'text-grade-danger' : 'text-grade-safe'}`}>{weekDiff > 0 ? '↑' : '↓'}{Math.abs(weekDiff)}%</p>
              <p className="text-xs text-text-muted">{t('overall_risk')}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{thisWeekScans.length}/7</p>
              <p className="text-xs text-text-muted">{t('scans_taken')}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">5/7</p>
              <p className="text-xs text-text-muted">{t('checkins_done')}</p>
            </div>
          </div>
        </div>

        {/* Compare view */}
        {comp.length === 2 && (
          <div className="bg-card border border-border rounded-card p-4 medical-shadow animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('compare')}</h3>
            <div className="grid grid-cols-2 gap-4">
              {comp.map(s => (
                <div key={s.id} className="space-y-2">
                  <p className="text-xs text-text-muted">{new Date(s.timestamp).toLocaleDateString()}</p>
                  <GradeBadge grade={s.grade} />
                  <p className={`text-2xl font-bold ${getRiskColor(s.overall_risk)}`}>{s.overall_risk}</p>
                  <div className="space-y-1">
                    {['heel','ball','arch','toe'].map(z => (
                      <div key={z} className="flex justify-between text-xs">
                        <span className="text-text-secondary">{t(z)}</span>
                        <span className="font-medium text-foreground">{(s as any)[z]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scan list */}
        <div className="space-y-2">
          {[...filteredScans].reverse().map(scan => {
            const d = new Date(scan.timestamp);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
            const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const isSelected = selected.includes(scan.id);
            const isExpanded = expandedScan === scan.id;

            return (
              <div key={scan.id}
                onClick={() => compareMode ? toggleSelect(scan.id) : setExpandedScan(isExpanded ? null : scan.id)}
                className={`bg-card border rounded-card p-3 medical-shadow cursor-pointer transition-colors ${isSelected ? 'border-primary bg-accent' : 'border-border'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{dateStr} · {timeStr}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <GradeBadge grade={scan.grade} showLabel={false} />
                      <span className="text-xs text-text-muted">{scan.trend === 'increasing' ? `↑ ${scan.trend_pct}%` : scan.trend === 'falling' ? `↓ ${scan.trend_pct}%` : 'stable'}</span>
                    </div>
                  </div>
                  <span className={`text-2xl font-bold ${getRiskColor(scan.overall_risk)}`}>{scan.overall_risk}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[{k:'heel',v:scan.heel},{k:'ball',v:scan.ball},{k:'arch',v:scan.arch},{k:'toe',v:scan.toe}].map(z => (
                    <span key={z.k} className={`text-xs px-2 py-0.5 rounded-pill ${z.v<40?'bg-success-bg text-grade-safe':z.v<70?'bg-warning-bg text-grade-watch':'bg-danger-bg text-grade-danger'}`}>
                      {t(z.k)} {z.v}
                    </span>
                  ))}
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2 animate-fade-in">
                    {scan.recommendations.map((r, i) => (
                      <p key={i} className="text-xs text-text-secondary">• {r}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <MedicalFooter />
      </div>
      <BottomNav />
      <SoleAssistant />
    </div>
  );
};

export default History;
