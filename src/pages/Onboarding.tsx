import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', age: '', diabetes_type: 'Type 2', diagnosis_year: '' });
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverContact, setCaregiverContact] = useState('');
  const navigate = useNavigate();
  const { t } = useLang();
  const { loginAsPatient } = useAuth();

  const handleFinish = () => {
    loginAsPatient({
      id: 'new-' + Date.now(),
      name: formData.name || 'Patient',
      age: parseInt(formData.age) || 0,
      diabetes_type: formData.diabetes_type,
      diagnosis_year: parseInt(formData.diagnosis_year) || 2020,
      baseline_established: false,
    });
    toast.success(t('ready_msg'));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-modal p-6 medical-shadow-lg">
        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">{t('welcome')}</h2>
            <p className="text-sm text-text-secondary">{t('welcome_msg')}</p>
            <div>
              <label className="text-sm font-medium text-foreground">{t('name')}</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('age')}</label>
              <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('diabetes_type')}</label>
              <div className="flex gap-2 mt-1">
                {['Type 1', 'Type 2', 'Pre-diabetic'].map(dt => (
                  <button key={dt} onClick={() => setFormData({...formData, diabetes_type: dt})}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${formData.diabetes_type === dt ? 'border-primary bg-accent text-primary' : 'border-border text-text-secondary hover:bg-secondary'}`}>
                    {dt === 'Type 1' ? t('type_1') : dt === 'Type 2' ? t('type_2') : t('pre_diabetic')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('diagnosis_year')}</label>
              <input type="number" value={formData.diagnosis_year} onChange={e => setFormData({...formData, diagnosis_year: e.target.value})} placeholder="2018" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button onClick={() => setStep(2)} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('next')}</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">{t('baseline_title')}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{t('baseline_desc')}</p>
            <div className="bg-accent rounded-card p-6 text-center">
              <svg viewBox="0 0 120 160" className="w-24 h-32 mx-auto mb-3">
                <ellipse cx="60" cy="80" rx="35" ry="70" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4" />
                <circle cx="60" cy="80" r="4" fill="hsl(var(--primary))" opacity="0.5" />
              </svg>
              <p className="text-xs text-text-secondary">Foot scan illustration</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium">{t('back')}</button>
              <button onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('begin_first_scan')}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">{t('add_caregiver')}</h2>
            <p className="text-sm text-text-secondary">{t('add_caregiver_desc')}</p>
            <div>
              <label className="text-sm font-medium text-foreground">{t('name')}</label>
              <input value={caregiverName} onChange={e => setCaregiverName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('email_phone')}</label>
              <input value={caregiverContact} onChange={e => setCaregiverContact(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary font-medium">{t('skip')}</button>
              <button onClick={() => { toast.success('Caregiver added'); setStep(4); }} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('save')}</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" strokeDasharray="24" className="animate-draw-check" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">{t('ready')}</h2>
            <p className="text-sm text-text-secondary">{t('ready_msg')}</p>
            <button onClick={handleFinish} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('go_to_dashboard')}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
