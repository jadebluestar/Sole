import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from '@/components/sole/AppHeader';
import MedicalFooter from '@/components/sole/MedicalFooter';
import GradeBadge from '@/components/sole/GradeBadge';
import { CLINIC_PATIENTS, getRiskColor, getGradeBg } from '@/lib/mockData';
import { Users, AlertTriangle, TrendingUp, Bell, Search, LogOut } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const Clinic: React.FC = () => {
  const { t } = useLang();
  const { isClinicianLoggedIn, loginAsClinician, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number | null>(null);
  const [trendFilter, setTrendFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  if (!isClinicianLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-modal p-6 medical-shadow-lg">
          <h2 className="text-xl font-bold text-foreground text-center mb-1">Clinician Login</h2>
          <p className="text-xs text-text-muted text-center mb-6">Access the clinical dashboard</p>
          <div className="space-y-3">
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder={t('username')}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('password')}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {error && <p className="text-xs text-grade-danger">{error}</p>}
            <button onClick={() => {
              if (username === 'admin' && password === 'sole2026') { loginAsClinician(); setError(''); }
              else setError('Invalid credentials. Use admin / sole2026');
            }} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('login')}</button>
          </div>
        </div>
      </div>
    );
  }

  const highRisk = CLINIC_PATIENTS.filter(p => p.latestScan.overall_risk > 70);
  const needFollowup = CLINIC_PATIENTS.filter(p => p.latestScan.trend === 'increasing');
  const alertsThisWeek = 2;

  const filtered = CLINIC_PATIENTS
    .filter(p => !gradeFilter || p.latestScan.grade === gradeFilter)
    .filter(p => !trendFilter || p.latestScan.trend === trendFilter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.latestScan.overall_risk - a.latestScan.overall_risk);

  const selectedP = selectedPatient ? CLINIC_PATIENTS.find(p => p.id === selectedPatient) : null;

  if (selectedP) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Patient Profile" showBack />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <button onClick={() => setSelectedPatient(null)} className="text-sm text-primary hover:underline">← Back to patients</button>
          <div className="bg-card border border-border rounded-card p-6 medical-shadow">
            <h2 className="text-xl font-bold text-foreground">{selectedP.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div><p className="text-xs text-text-muted">{t('age')}</p><p className="font-semibold text-foreground">{selectedP.age}</p></div>
              <div><p className="text-xs text-text-muted">{t('diabetes_type')}</p><p className="font-semibold text-foreground">{selectedP.diabetes_type}</p></div>
              <div><p className="text-xs text-text-muted">{t('latest_grade')}</p><GradeBadge grade={selectedP.latestScan.grade} /></div>
              <div><p className="text-xs text-text-muted">{t('risk_score')}</p><p className={`text-2xl font-bold ${getRiskColor(selectedP.latestScan.overall_risk)}`}>{selectedP.latestScan.overall_risk}</p></div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-card p-4 medical-shadow">
            <h3 className="text-sm font-semibold text-foreground mb-2">Zone Scores</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              {['heel','ball','arch','toe'].map(z => (
                <div key={z}>
                  <p className="text-xs text-text-muted">{t(z)}</p>
                  <p className={`text-lg font-bold ${getRiskColor((selectedP.latestScan as any)[z])}`}>{(selectedP.latestScan as any)[z]}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-card p-4 medical-shadow">
            <h3 className="text-sm font-semibold text-foreground mb-2">{t('recommendations')}</h3>
            {selectedP.latestScan.recommendations.map((r, i) => (
              <p key={i} className="text-sm text-text-secondary mb-1">• {r}</p>
            ))}
          </div>
          <MedicalFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-surface border-b border-border medical-shadow">
        <div className="flex items-center justify-between h-14 px-4 max-w-6xl mx-auto">
          <span className="text-lg font-bold text-primary">Sole</span>
          <span className="text-sm font-semibold text-foreground">Clinical Dashboard</span>
          <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-lg hover:bg-secondary text-text-secondary">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: t('total_patients'), value: CLINIC_PATIENTS.length, color: 'text-primary' },
            { icon: AlertTriangle, label: t('high_risk'), value: highRisk.length, color: 'text-grade-danger' },
            { icon: TrendingUp, label: t('require_followup'), value: needFollowup.length, color: 'text-grade-watch' },
            { icon: Bell, label: t('alerts_this_week'), value: alertsThisWeek, color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-card p-4 medical-shadow">
              <s.icon size={18} className={`${s.color} mb-2`} />
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-1">
            {[null, 1, 2, 3, 4].map(g => (
              <button key={String(g)} onClick={() => setGradeFilter(g)}
                className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${gradeFilter === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-text-secondary'}`}>
                {g === null ? 'All' : `Grade ${g}`}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {[null, 'increasing', 'stable', 'falling'].map(tr => (
              <button key={String(tr)} onClick={() => setTrendFilter(tr)}
                className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${trendFilter === tr ? 'bg-primary text-primary-foreground' : 'bg-secondary text-text-secondary'}`}>
                {tr === null ? 'All' : tr.charAt(0).toUpperCase() + tr.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Patient table */}
        <div className="bg-card border border-border rounded-card medical-shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[t('patient'), t('latest_grade'), t('risk_score'), t('trend_7day'), t('last_scan'), t('action')].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const sparkData = Array.from({length: 7}, (_, i) => ({ v: Math.max(10, p.latestScan.overall_risk - (6-i) * (p.latestScan.trend === 'increasing' ? 3 : p.latestScan.trend === 'falling' ? -2 : 0.5)) }));
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-text-muted">{p.diabetes_type} · {p.age}yo</p>
                    </td>
                    <td className="px-4 py-3"><GradeBadge grade={p.latestScan.grade} showLabel={false} /></td>
                    <td className="px-4 py-3"><span className={`text-xl font-bold ${getRiskColor(p.latestScan.overall_risk)}`}>{p.latestScan.overall_risk}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-6">
                          <ResponsiveContainer><LineChart data={sparkData}><Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} /></LineChart></ResponsiveContainer>
                        </div>
                        <span className={`text-xs ${p.latestScan.trend === 'increasing' ? 'text-grade-danger' : p.latestScan.trend === 'falling' ? 'text-grade-safe' : 'text-text-muted'}`}>
                          {p.latestScan.trend === 'increasing' ? '↑' : p.latestScan.trend === 'falling' ? '↓' : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{new Date(p.latestScan.timestamp).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedPatient(p.id)} className="px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-accent transition-colors">
                        {t('view_profile')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <MedicalFooter />
      </div>
    </div>
  );
};

export default Clinic;
