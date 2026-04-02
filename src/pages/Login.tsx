import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [tab, setTab] = useState<'patient' | 'clinician'>('patient');
  const [name, setName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { t } = useLang();
  const { loginAsDemo, loginAsPatient, loginAsClinician } = useAuth();

  const handlePatientLogin = () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    loginAsPatient({ id: patientId || 'new', name, age: 0, diabetes_type: '', diagnosis_year: 0, baseline_established: false });
    navigate(patientId ? '/dashboard' : '/onboarding');
  };

  const handleClinicianLogin = () => {
    if (username === 'admin' && password === 'sole2026') {
      loginAsClinician();
      navigate('/clinic');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-modal p-6 medical-shadow-lg">
        <div className="text-center mb-6">
          <span className="text-2xl font-bold text-primary">Sole</span>
          <p className="text-xs text-text-muted mt-1">{t('tagline')}</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-secondary p-1 mb-6">
          <button onClick={() => setTab('patient')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'patient' ? 'bg-card text-foreground medical-shadow' : 'text-text-secondary'}`}>
            {t('patient_tab')}
          </button>
          <button onClick={() => setTab('clinician')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'clinician' ? 'bg-card text-foreground medical-shadow' : 'text-text-secondary'}`}>
            {t('clinician_tab')}
          </button>
        </div>

        {tab === 'patient' ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">{t('name')}</label>
              <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('patient_id')}</label>
              <input value={patientId} onChange={e => setPatientId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button onClick={handlePatientLogin} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              {t('continue_btn')}
            </button>
            <button onClick={() => navigate('/onboarding')} className="w-full text-sm text-primary hover:underline">
              {t('new_patient')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">{t('username')}</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button onClick={handleClinicianLogin} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              {t('login')}
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border">
          <button onClick={handleDemo} className="w-full py-2.5 rounded-lg border border-primary text-primary font-medium hover:bg-accent transition-colors text-sm">
            {t('try_demo')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
