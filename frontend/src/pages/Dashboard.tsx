import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from '@/components/sole/AppHeader';
import BottomNav from '@/components/sole/BottomNav';
import SoleAssistant from '@/components/sole/SoleAssistant';
import MedicalFooter from '@/components/sole/MedicalFooter';
import RiskScore from '@/components/sole/RiskScore';
import GradeBadge from '@/components/sole/GradeBadge';
import ZoneBar from '@/components/sole/ZoneBar';
import { DEMO_SCANS, DEMO_CHECKINS, DEMO_BASELINE, getRiskColor } from '@/lib/mockData';
import { LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Activity, Droplets, Moon as MoonIcon, Lightbulb } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { patient } = useAuth();

  const latestScan = DEMO_SCANS[DEMO_SCANS.length - 1];
  const prevScan = DEMO_SCANS[DEMO_SCANS.length - 2];
  const lastCheckin = DEMO_CHECKINS[DEMO_CHECKINS.length - 1];
  const firstName = patient?.name?.split(' ')[0] || 'Patient';

  const trendData = DEMO_SCANS.slice(-7).map(s => ({ risk: s.overall_risk }));

  const zones = [
    { key: 'heel', score: latestScan.heel, prev: prevScan.heel },
    { key: 'ball', score: latestScan.ball, prev: prevScan.ball },
    { key: 'arch', score: latestScan.arch, prev: prevScan.arch },
    { key: 'toe', score: latestScan.toe, prev: prevScan.toe },
  ];

  const baselineDiffs = {
    heel: latestScan.heel - DEMO_BASELINE.heel_avg,
    ball: latestScan.ball - DEMO_BASELINE.ball_avg,
    arch: latestScan.arch - DEMO_BASELINE.arch_avg,
    toe: latestScan.toe - DEMO_BASELINE.toe_avg,
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title={t('dashboard')} />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('good_morning')}, {firstName}</h1>
          <p className="text-sm text-text-secondary">{today}</p>
          <p className="text-xs text-text-muted mt-0.5">{t('foot_health_glance')}</p>
        </div>

        {/* Risk Score Card */}
        <div className="bg-card border border-border rounded-card p-6 medical-shadow text-center">
          <RiskScore score={latestScan.overall_risk} />
          <p className="text-sm font-medium text-text-secondary mt-1">{t('overall_risk')}</p>
          <div className="mt-2">
            <GradeBadge grade={latestScan.grade} />
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <TrendingUp size={14} className="text-grade-watch" />
            <span className="text-sm text-grade-watch font-medium">↑ {latestScan.trend_pct}% {t('from_last_scan')}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t('last_scanned')}: 1 {t('days_ago')}</p>
          <button onClick={() => navigate('/scan')} className="mt-4 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            {t('scan_today')}
          </button>
        </div>

        {/* Zone Scores */}
        <div className="grid grid-cols-4 gap-2">
          {zones.map(z => {
            const colorClass = getRiskColor(z.score);
            return (
              <div key={z.key} className="bg-card border border-border rounded-card p-3 text-center medical-shadow">
                <p className="text-xs font-medium text-text-secondary">{t(z.key)}</p>
                <p className={`text-xl font-bold ${colorClass}`}>{z.score}</p>
                <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${z.score < 40 ? 'bg-grade-safe' : z.score < 70 ? 'bg-grade-watch' : 'bg-grade-danger'}`} style={{ width: `${z.score}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 7-day Trend */}
        <div className="bg-card border border-border rounded-card p-4 medical-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-2">{t('trend_7day')}</h3>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={trendData}>
              <Line type="monotone" dataKey="risk" stroke="hsl(174, 84%, 32%)" strokeWidth={2} dot={false} />
              <ReferenceLine y={70} stroke="hsl(0, 72%, 51%)" strokeDasharray="4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Baseline Comparison */}
        <div className="bg-card border border-border rounded-card p-4 medical-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('compared_baseline')}</h3>
          <div className="space-y-2">
            {Object.entries(baselineDiffs).map(([zone, diff]) => (
              <div key={zone} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary capitalize">{t(zone)}</span>
                <span className={`font-medium ${diff > 10 ? 'text-grade-danger' : diff > 3 ? 'text-grade-watch' : 'text-grade-safe'}`}>
                  {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '0%'} {diff > 3 ? t('above_baseline') : diff < -3 ? t('below_baseline') : t('stable')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vitals Summary */}
        <div className="bg-card border border-border rounded-card p-4 medical-shadow">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Droplets size={18} className="mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">{lastCheckin?.blood_sugar || '--'}</p>
              <p className="text-xs text-text-muted">{t('blood_sugar_unit')}</p>
            </div>
            <div className="text-center">
              <Activity size={18} className="mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">{lastCheckin?.steps?.toLocaleString() || '--'}</p>
              <p className="text-xs text-text-muted">{t('steps')}</p>
            </div>
            <div className="text-center">
              <MoonIcon size={18} className="mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">{lastCheckin?.sleep_hours || '--'}</p>
              <p className="text-xs text-text-muted">{t('hours')}</p>
            </div>
          </div>
          <button onClick={() => navigate('/checkin')} className="w-full mt-3 py-2 text-sm font-medium text-primary hover:bg-accent rounded-lg transition-colors">
            {t('log_vitals')}
          </button>
        </div>

        {/* AI Insight */}
        <div className="bg-accent border-l-4 border-primary rounded-card p-4">
          <div className="flex items-start gap-2">
            <Lightbulb size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('ai_insight')}</h3>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                Your heel risk has risen 3 scans in a row and your blood sugar was elevated recently at {lastCheckin?.blood_sugar} mg/dL. Consider reducing standing time and checking your heel carefully tonight.
              </p>
            </div>
          </div>
        </div>

        <MedicalFooter />
      </div>
      <BottomNav />
      <SoleAssistant />
    </div>
  );
};

export default Dashboard;
