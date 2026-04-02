import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import AppHeader from '@/components/sole/AppHeader';
import BottomNav from '@/components/sole/BottomNav';
import SoleAssistant from '@/components/sole/SoleAssistant';
import FootDiagram from '@/components/sole/FootDiagram';
import { toast } from 'sonner';

const Checkin: React.FC = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [section, setSection] = useState(0);
  const [bloodSugar, setBloodSugar] = useState('');
  const [steps, setSteps] = useState('');
  const [activeMinutes, setActiveMinutes] = useState('');
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState('');
  const [hasSymptoms, setHasSymptoms] = useState(false);
  const [symptomZones, setSymptomZones] = useState<string[]>([]);
  const [symptomType, setSymptomType] = useState('');
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const streak = 12;

  const bsNum = parseInt(bloodSugar);
  const bsColor = !bsNum ? '' : bsNum < 70 ? 'border-grade-danger' : bsNum <= 140 ? 'border-grade-safe' : bsNum <= 180 ? 'border-grade-watch' : 'border-grade-danger';

  const toggleZone = (z: string) => setSymptomZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);

  const handleSubmit = () => {
    setSubmitted(true);
    toast.success(t('checkin_saved'));
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  const totalSections = 5;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" strokeDasharray="24" className="animate-draw-check" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary">{t('checkin_saved')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title={t('morning_checkin')} />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Streak + Progress */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">{t('morning_checkin')}</h1>
          <span className="text-sm font-medium text-primary">{streak} {t('day_streak')} 🔥</span>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: totalSections }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= section ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>

        {/* Section 0: Blood Sugar */}
        {section === 0 && (
          <div className="bg-card border border-border rounded-card p-4 medical-shadow animate-fade-in space-y-4">
            <h2 className="text-base font-semibold text-foreground">{t('blood_sugar')}</h2>
            <div className="text-center">
              <input type="number" value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} placeholder="120"
                className={`text-center text-4xl font-bold w-32 py-3 rounded-lg border-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${bsColor || 'border-input'}`} />
              <p className="text-xs text-text-muted mt-1">{t('blood_sugar_unit')}</p>
            </div>
            {/* Reference bar */}
            <div className="h-2 rounded-full flex overflow-hidden">
              <div className="flex-[70] bg-grade-danger/30" />
              <div className="flex-[70] bg-grade-safe/30" />
              <div className="flex-[40] bg-grade-watch/30" />
              <div className="flex-[40] bg-grade-danger/30" />
            </div>
            <div className="flex gap-2">
              {[{l: t('low'), v: '65'}, {l: t('normal'), v: '110'}, {l: t('high'), v: '170'}].map(b => (
                <button key={b.l} onClick={() => setBloodSugar(b.v)}
                  className="flex-1 py-2 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-secondary transition-colors">{b.l}</button>
              ))}
            </div>
            <p className="text-xs text-text-muted">{t('correlation_note')}</p>
            <button onClick={() => setSection(1)} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('next')}</button>
          </div>
        )}

        {/* Section 1: Activity */}
        {section === 1 && (
          <div className="bg-card border border-border rounded-card p-4 medical-shadow animate-fade-in space-y-4">
            <h2 className="text-base font-semibold text-foreground">{t('activity')}</h2>
            <div>
              <label className="text-sm font-medium text-foreground">{t('yesterdays_steps')}</label>
              <input type="number" value={steps} onChange={e => setSteps(e.target.value)} placeholder="5000"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <p className="text-xs text-text-muted mt-1">{t('who_steps')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('active_minutes')}</label>
              <input type="number" value={activeMinutes} onChange={e => setActiveMinutes(e.target.value)} placeholder="30"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSection(0)} className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium">{t('back')}</button>
              <button onClick={() => setSection(2)} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('next')}</button>
            </div>
          </div>
        )}

        {/* Section 2: Sleep */}
        {section === 2 && (
          <div className="bg-card border border-border rounded-card p-4 medical-shadow animate-fade-in space-y-4">
            <h2 className="text-base font-semibold text-foreground">{t('sleep')}</h2>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{sleepHours}</p>
              <p className="text-xs text-text-muted">{t('hours')}</p>
              <input type="range" min={4} max={12} step={0.5} value={sleepHours} onChange={e => setSleepHours(parseFloat(e.target.value))}
                className="w-full mt-3 accent-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">{t('sleep_quality')}</p>
              <div className="flex gap-2">
                {['poor', 'fair', 'good'].map(q => (
                  <button key={q} onClick={() => setSleepQuality(q)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${sleepQuality === q ? 'border-primary bg-accent text-primary' : 'border-border text-text-secondary'}`}>
                    {t(q)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSection(1)} className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium">{t('back')}</button>
              <button onClick={() => setSection(3)} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('next')}</button>
            </div>
          </div>
        )}

        {/* Section 3: Foot Symptoms */}
        {section === 3 && (
          <div className="bg-card border border-border rounded-card p-4 medical-shadow animate-fade-in space-y-4">
            <h2 className="text-base font-semibold text-foreground">{t('foot_symptoms')}</h2>
            <p className="text-sm text-text-secondary">{t('symptoms_question')}</p>
            <div className="flex gap-3">
              <button onClick={() => setHasSymptoms(false)}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg border transition-colors ${!hasSymptoms ? 'border-grade-safe bg-success-bg text-grade-safe' : 'border-border text-text-secondary'}`}>
                {t('no')}
              </button>
              <button onClick={() => setHasSymptoms(true)}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg border transition-colors ${hasSymptoms ? 'border-grade-danger bg-danger-bg text-grade-danger' : 'border-border text-text-secondary'}`}>
                {t('yes')}
              </button>
            </div>
            {hasSymptoms && (
              <div className="space-y-4 animate-fade-in">
                <FootDiagram selectedZones={symptomZones} onToggleZone={toggleZone} />
                <div className="flex flex-wrap gap-2">
                  {['pain', 'numbness', 'tingling', 'swelling'].map(s => (
                    <button key={s} onClick={() => setSymptomType(s)}
                      className={`px-3 py-1.5 rounded-pill text-xs font-medium border transition-colors ${symptomType === s ? 'border-primary bg-accent text-primary' : 'border-border text-text-secondary'}`}>
                      {t(s)}
                    </button>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>{t('severity')}: {severity}/10</span>
                    <span>{severity <= 3 ? t('mild') : severity <= 6 ? t('moderate') : t('severe')}</span>
                  </div>
                  <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(parseInt(e.target.value))}
                    className="w-full accent-primary" />
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setSection(2)} className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium">{t('back')}</button>
              <button onClick={() => setSection(4)} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('next')}</button>
            </div>
          </div>
        )}

        {/* Section 4: Notes */}
        {section === 4 && (
          <div className="bg-card border border-border rounded-card p-4 medical-shadow animate-fade-in space-y-4">
            <h2 className="text-base font-semibold text-foreground">{t('notes')}</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notes_placeholder')}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setSection(3)} className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium">{t('back')}</button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('save_checkin')}</button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
      <SoleAssistant />
    </div>
  );
};

export default Checkin;
