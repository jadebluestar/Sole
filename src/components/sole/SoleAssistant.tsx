import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_SCANS, DEMO_CHECKINS, DEMO_BASELINE } from '@/lib/mockData';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SoleAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [hasProactive, setHasProactive] = useState(true);
  const { t } = useLang();
  const { patient } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = (userMsg: string): string => {
    const lastScan = DEMO_SCANS[DEMO_SCANS.length - 1];
    const lastCheckin = DEMO_CHECKINS[DEMO_CHECKINS.length - 1];
    const name = patient?.name?.split(' ')[0] || 'there';

    if (userMsg.toLowerCase().includes('worse') || userMsg.toLowerCase().includes('बिगड़')) {
      return `${name}, your heel risk has risen from ${DEMO_SCANS[DEMO_SCANS.length - 3].heel} to ${lastScan.heel} over the last 3 scans. I'd recommend reducing standing time and scheduling a check with your doctor this week.`;
    }
    if (userMsg.toLowerCase().includes('grade') || userMsg.toLowerCase().includes('ग्रेड')) {
      return `Your current grade is ${lastScan.grade} (${lastScan.grade_label}). This means there's an elevated risk of deeper tissue involvement. It's important to keep the area clean and avoid prolonged pressure. Please consult your podiatrist for a clinical assessment.`;
    }
    if (userMsg.toLowerCase().includes('doctor') || userMsg.toLowerCase().includes('डॉक्टर')) {
      const urgency = lastScan.overall_risk >= 70 ? 'Yes, I would recommend seeing your doctor within the next few days.' : 'Your risk level is manageable, but a routine check would be good.';
      return `${urgency} Your overall risk is ${lastScan.overall_risk}/100 and your blood sugar was ${lastCheckin?.blood_sugar || 'not logged'} mg/dL recently.`;
    }
    return `${name}, your current risk score is ${lastScan.overall_risk}/100 with your heel being the highest concern at ${lastScan.heel}. Compared to your baseline, your heel is ${lastScan.heel - DEMO_BASELINE.heel_avg}% above normal. Please keep monitoring daily and don't hesitate to reach out to your doctor.`;
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setHasProactive(false);

    const userMessage: ChatMessage = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setTyping(true);

    setTimeout(() => {
      const response = generateResponse(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
      setTyping(false);
    }, 1200);
  };

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0 && hasProactive) {
      setTimeout(() => {
        setMessages([{
          role: 'assistant',
          content: `I noticed your heel risk has risen for 3 scans in a row. Would you like to know what this could mean?`,
          timestamp: new Date(),
        }]);
        setHasProactive(false);
      }, 500);
    }
  };

  if (!patient) return null;

  const suggestions = [t('ask_worse'), t('ask_grade'), t('ask_doctor')];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center medical-shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle size={22} />
        {hasProactive && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-grade-danger animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-surface border-t border-border rounded-t-modal medical-shadow-lg animate-fade-in"
          style={{ height: '70vh', maxHeight: '600px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('sole_assistant')}</h3>
              <p className="text-xs text-text-muted">{t('powered_by')}</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-secondary rounded-lg text-text-secondary">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100% - 120px)' }}>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center pt-8">
                {suggestions.map(s => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="px-3 py-1.5 rounded-pill border border-primary text-primary text-xs font-medium hover:bg-accent transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-surface-elevated border border-border text-foreground rounded-bl-sm'
                }`}>
                  {msg.content}
                  <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-primary-foreground/70' : 'text-text-muted'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-surface-elevated border border-border px-4 py-2 rounded-xl rounded-bl-sm flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-border bg-surface">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t('type_message')}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={() => handleSend()} className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SoleAssistant;
