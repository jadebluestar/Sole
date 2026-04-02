import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Brain, Shield, Wifi, TrendingUp, Settings, Bell } from 'lucide-react';
import MedicalFooter from '@/components/sole/MedicalFooter';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLang();
  const { dark, toggleTheme } = useTheme();

  const features = [
    { icon: Brain, title: t('ai_diagnostics'), desc: t('ai_diagnostics_desc') },
    { icon: Shield, title: t('patient_privacy'), desc: t('patient_privacy_desc') },
    { icon: Wifi, title: t('remote_care'), desc: t('remote_care_desc') },
    { icon: TrendingUp, title: t('predictive_analytics'), desc: t('predictive_analytics_desc') },
    { icon: Settings, title: t('workflow_automation'), desc: t('workflow_automation_desc') },
    { icon: Bell, title: t('caregiver_alerts'), desc: t('caregiver_alerts_desc') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-primary">Sole</span>
        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="text-xs font-medium px-2 py-1 rounded-pill border border-border hover:bg-secondary transition-colors text-foreground">
            {lang === 'en' ? 'EN' : 'हि'} | {lang === 'en' ? 'हि' : 'EN'}
          </button>
          <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-secondary text-foreground"><>{dark ? <Sun size={16} /> : <Moon size={16} />}</></button>
          <button onClick={() => navigate('/login')} className="px-4 py-1.5 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-accent transition-colors">
            {t('login')}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t('tagline')}</h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">{t('hero_sub')}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            {t('get_started')}
          </button>
          <button className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors">
            {t('learn_more')}
          </button>
        </div>
        {/* Abstract illustration */}
        <div className="mt-12 mx-auto max-w-md">
          <svg viewBox="0 0 400 200" className="w-full">
            <rect x="20" y="20" width="360" height="160" rx="16" fill="hsl(var(--surface-elevated))" stroke="hsl(var(--border))" strokeWidth="1" />
            <rect x="40" y="40" width="80" height="50" rx="8" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.8" />
            <text x="80" y="60" textAnchor="middle" className="text-xs fill-primary font-semibold">82</text>
            <text x="80" y="78" textAnchor="middle" className="text-[8px] fill-text-secondary">Risk</text>
            <rect x="140" y="40" width="100" height="50" rx="8" fill="hsl(var(--success-bg))" stroke="hsl(var(--grade-safe))" strokeWidth="1" opacity="0.8" />
            <text x="190" y="68" textAnchor="middle" className="text-[8px] fill-text-secondary">Grade 1</text>
            <rect x="260" y="40" width="100" height="50" rx="8" fill="hsl(var(--warning-bg))" stroke="hsl(var(--grade-watch))" strokeWidth="1" opacity="0.8" />
            <text x="310" y="68" textAnchor="middle" className="text-[8px] fill-text-secondary">Grade 2</text>
            {/* Fake chart line */}
            <polyline points="40,140 80,135 120,130 160,125 200,128 240,132 280,138 320,145 360,150" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
            <line x1="40" y1="130" x2="360" y2="130" stroke="hsl(var(--grade-danger))" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary text-primary-foreground py-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-around gap-4 px-6">
          <div className="text-center"><span className="text-2xl font-bold">537M+</span><p className="text-sm opacity-90">{t('stat_diabetics')}</p></div>
          <div className="text-center"><span className="text-2xl font-bold">85%</span><p className="text-sm opacity-90">{t('stat_prevent')}</p></div>
          <div className="text-center"><span className="text-2xl font-bold">1 in 4</span><p className="text-sm opacity-90">{t('stat_ulcers')}</p></div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-card border border-border rounded-card p-6 medical-shadow">
              <f.icon size={24} className="text-primary mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-foreground mb-10">How it works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {[
            { step: '1', label: t('step_scan'), desc: 'Take a photo of your foot' },
            { step: '2', label: t('step_analyse'), desc: 'AI classifies risk instantly' },
            { step: '3', label: t('step_act'), desc: 'Get personalized guidance' },
          ].map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent text-primary font-bold text-xl flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <h4 className="font-semibold text-foreground">{s.label}</h4>
                <p className="text-sm text-text-secondary mt-1">{s.desc}</p>
              </div>
              {i < 2 && <div className="hidden md:block w-16 h-px bg-border" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      <MedicalFooter />
    </div>
  );
};

export default Landing;
