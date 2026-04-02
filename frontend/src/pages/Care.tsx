import React, { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import AppHeader from '@/components/sole/AppHeader';
import BottomNav from '@/components/sole/BottomNav';
import SoleAssistant from '@/components/sole/SoleAssistant';
import MedicalFooter from '@/components/sole/MedicalFooter';
import { DEMO_CAREGIVERS, DEMO_ALERTS, type Caregiver } from '@/lib/mockData';
import { Lock, Bell, BellOff, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Care: React.FC = () => {
  const { t } = useLang();
  const [tab, setTab] = useState<'caregivers' | 'alerts'>('caregivers');
  const [caregivers, setCaregivers] = useState<Caregiver[]>(DEMO_CAREGIVERS);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Child');
  const [newContact, setNewContact] = useState('');
  const [newThreshold, setNewThreshold] = useState(70);

  const handleAdd = () => {
    if (!newName || !newContact) { toast.error('Please fill required fields'); return; }
    setCaregivers([...caregivers, {
      id: 'cg-' + Date.now(), patient_id: 'demo', name: newName, relation: newRelation,
      contact: newContact, alert_threshold: newThreshold, alerts_enabled: true, last_alerted: null,
    }]);
    setShowAdd(false);
    setNewName(''); setNewContact('');
    toast.success('Caregiver added');
  };

  const toggleAlerts = (id: string) => {
    setCaregivers(caregivers.map(c => c.id === id ? { ...c, alerts_enabled: !c.alerts_enabled } : c));
  };

  const removeCG = (id: string) => {
    setCaregivers(caregivers.filter(c => c.id !== id));
    toast.success('Caregiver removed');
  };

  const relations = ['spouse', 'parent', 'child', 'friend', 'doctor', 'other'];

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title={t('caregiver')} />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex rounded-lg bg-secondary p-1">
          <button onClick={() => setTab('caregivers')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'caregivers' ? 'bg-card text-foreground medical-shadow' : 'text-text-secondary'}`}>
            {t('my_caregivers')}
          </button>
          <button onClick={() => setTab('alerts')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'alerts' ? 'bg-card text-foreground medical-shadow' : 'text-text-secondary'}`}>
            {t('alert_log')}
          </button>
        </div>

        {tab === 'caregivers' && (
          <>
            {caregivers.map(cg => (
              <div key={cg.id} className="bg-card border border-border rounded-card p-4 medical-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-sm">
                      {cg.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{cg.name}</p>
                      <p className="text-xs text-text-secondary">{cg.relation} · {cg.contact}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {cg.last_alerted ? `${t('last_alerted')}: ${new Date(cg.last_alerted).toLocaleDateString()}` : t('never_alerted')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleAlerts(cg.id)} className="p-1.5 rounded-lg hover:bg-secondary text-text-secondary">
                      {cg.alerts_enabled ? <Bell size={14} /> : <BellOff size={14} />}
                    </button>
                    <button onClick={() => removeCG(cg.id)} className="p-1.5 rounded-lg hover:bg-secondary text-text-secondary">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  {cg.alerts_enabled ? t('alerts_on') : t('alerts_off')} · {t('alert_threshold')}: {cg.alert_threshold}/100
                </p>
              </div>
            ))}

            {/* Add caregiver */}
            {!showAdd ? (
              <button onClick={() => setShowAdd(true)} className="w-full py-3 rounded-lg border border-primary text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent transition-colors">
                <Plus size={16} />{t('add_caregiver')}
              </button>
            ) : (
              <div className="bg-card border border-border rounded-modal p-4 medical-shadow space-y-3 animate-fade-in">
                <h3 className="text-sm font-semibold text-foreground">{t('add_caregiver')}</h3>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('name')}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <div className="flex flex-wrap gap-1.5">
                  {relations.map(r => (
                    <button key={r} onClick={() => setNewRelation(r)}
                      className={`px-3 py-1 rounded-pill text-xs font-medium border transition-colors ${newRelation === r ? 'border-primary bg-accent text-primary' : 'border-border text-text-secondary'}`}>
                      {t(r)}
                    </button>
                  ))}
                </div>
                <input value={newContact} onChange={e => setNewContact(e.target.value)} placeholder={t('email_phone')}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <div>
                  <p className="text-xs text-text-muted mb-1">{t('alert_threshold')}: {newThreshold}/100</p>
                  <input type="range" min={40} max={90} value={newThreshold} onChange={e => setNewThreshold(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg border border-border text-text-secondary text-sm">{t('skip')}</button>
                  <button onClick={handleAdd} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">{t('save')}</button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'alerts' && (
          <div className="space-y-2">
            {DEMO_ALERTS.map(alert => (
              <div key={alert.id} className={`bg-card border rounded-card p-3 medical-shadow ${!alert.dismissed ? 'border-l-4 border-l-grade-danger border-border' : 'border-border'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{alert.trigger_reason}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(alert.timestamp).toLocaleDateString()} · {alert.caregiver_name} notified
                    </p>
                  </div>
                  <span className="text-lg font-bold text-grade-danger">{alert.risk_score}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Privacy card */}
        <div className="bg-card border border-border rounded-card p-4 medical-shadow">
          <div className="flex items-start gap-3">
            <Lock size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('privacy_title')}</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{t('privacy_desc')}</p>
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

export default Care;
