import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import AppHeader from '@/components/sole/AppHeader';
import BottomNav from '@/components/sole/BottomNav';
import SoleAssistant from '@/components/sole/SoleAssistant';
import GradeBadge from '@/components/sole/GradeBadge';
import ZoneBar from '@/components/sole/ZoneBar';
import { DEMO_SCANS } from '@/lib/mockData';
import { Camera, RotateCcw, Shield } from 'lucide-react';
import { toast } from 'sonner';

type ScanStep = 'camera' | 'preview' | 'processing' | 'results';

const Scan: React.FC = () => {
  const [step, setStep] = useState<ScanStep>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showProbs, setShowProbs] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { t } = useLang();

  // Mock scan result derived from last demo scan data
  const mockResult = DEMO_SCANS[DEMO_SCANS.length - 1];
  const prevScan = DEMO_SCANS[DEMO_SCANS.length - 2];

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Fallback: use a placeholder
    }
  }, []);

  React.useEffect(() => {
    if (step === 'camera') startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [step, startCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth || 320;
      canvasRef.current.height = videoRef.current.videoHeight || 240;
      ctx?.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvasRef.current.toDataURL('image/jpeg'));
      (videoRef.current.srcObject as MediaStream)?.getTracks().forEach(t => t.stop());
    } else {
      // If camera not available, use placeholder
      setCapturedImage('placeholder');
    }
    setStep('preview');
  };

  const analyse = () => {
    setStep('processing');
    setTimeout(() => setStep('results'), 2500);
  };

  const saveScan = () => {
    toast.success(t('scan_saved'));
    navigate('/dashboard');
  };

  const recs = mockResult.recommendations;
  const gradeColors = ['border-grade-safe', 'border-grade-watch', 'border-grade-danger', 'border-grade-critical'];

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title={t('scan')} showBack />
      <canvas ref={canvasRef} className="hidden" />

      {step === 'camera' && (
        <div className="relative" style={{ height: 'calc(100vh - 130px)' }}>
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover bg-foreground/5" />
          {/* Foot overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 200 300" className="w-48 h-72 opacity-50">
              <ellipse cx="100" cy="150" rx="55" ry="130" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="8" />
            </svg>
          </div>
          <div className="absolute top-4 left-4 flex items-center gap-1 text-xs text-primary bg-surface/80 px-2 py-1 rounded-pill">
            <Shield size={10} />{t('image_stays')}
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-sm text-surface mb-4 bg-foreground/50 inline-block px-3 py-1 rounded-pill">{t('align_foot')}</p>
            <div className="flex justify-center">
              <button onClick={capture} className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center medical-shadow-lg hover:scale-105 transition-transform">
                <Camera size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4 animate-fade-in">
          <div className="bg-foreground/5 rounded-card overflow-hidden aspect-[3/4] flex items-center justify-center">
            {capturedImage === 'placeholder' ? (
              <div className="text-center p-8">
                <Camera size={48} className="mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-muted">Camera preview (camera not available in this environment)</p>
              </div>
            ) : (
              <img src={capturedImage!} alt="Captured foot" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('camera')} className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium">{t('retake')}</button>
            <button onClick={analyse} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('analyse')}</button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="max-w-lg mx-auto px-4 py-6 animate-fade-in">
          <div className="relative bg-foreground/5 rounded-card overflow-hidden aspect-[3/4] flex items-center justify-center">
            {capturedImage === 'placeholder' ? (
              <Camera size={48} className="text-text-muted" />
            ) : (
              <img src={capturedImage!} alt="Scanning" className="w-full h-full object-cover" />
            )}
            {/* Scan line */}
            <div className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_12px_hsl(var(--primary))] animate-scan-line" />
          </div>
          <div className="text-center mt-4">
            <p className="text-base font-semibold text-foreground">{t('analysing_zones')}</p>
            <p className="text-xs text-text-muted mt-1">{t('model_info')}</p>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4 animate-fade-in">
          {/* Heatmap placeholder */}
          <div className="relative bg-foreground/5 rounded-card overflow-hidden aspect-[3/4] flex items-center justify-center">
            {capturedImage === 'placeholder' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Camera size={48} className="text-text-muted" />
                <div className="absolute inset-0 bg-gradient-to-b from-grade-safe/20 via-grade-watch/30 to-grade-danger/40 rounded-card" />
              </div>
            ) : (
              <>
                <img src={capturedImage!} alt="Result" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-grade-safe/20 via-grade-watch/30 to-grade-danger/40 rounded-card" />
              </>
            )}
          </div>

          {/* Grade */}
          <div className="text-center">
            <GradeBadge grade={mockResult.grade} />
            <p className="text-sm text-text-secondary mt-2">{mockResult.confidence}% {t('confidence')}</p>
          </div>

          {/* Zone bars */}
          <div className="bg-card border border-border rounded-card p-4 medical-shadow space-y-3">
            <ZoneBar label={t('heel')} score={mockResult.heel} change={mockResult.heel - prevScan.heel} />
            <ZoneBar label={t('ball')} score={mockResult.ball} change={mockResult.ball - prevScan.ball} />
            <ZoneBar label={t('arch')} score={mockResult.arch} change={mockResult.arch - prevScan.arch} />
            <ZoneBar label={t('toe')} score={mockResult.toe} change={mockResult.toe - prevScan.toe} />
          </div>

          {/* Probability breakdown */}
          <div className="bg-card border border-border rounded-card medical-shadow overflow-hidden">
            <button onClick={() => setShowProbs(!showProbs)} className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-foreground">
              {t('probability_breakdown')}
              <span className="text-text-muted">{showProbs ? '▲' : '▼'}</span>
            </button>
            {showProbs && (
              <div className="px-4 pb-4 space-y-2 animate-fade-in">
                {Object.entries(mockResult.probabilities).map(([grade, prob]) => (
                  <div key={grade} className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary w-16">{grade}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${prob}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-10 text-right">{prob}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{t('recommendations')}</h3>
            {recs.map((rec, i) => {
              const [title, ...rest] = rec.split(' — ');
              return (
                <div key={i} className={`border-l-4 ${gradeColors[Math.min(mockResult.grade - 1, 3)]} bg-card border border-border rounded-card p-3 medical-shadow`}>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  {rest.length > 0 && <p className="text-xs text-text-secondary mt-0.5">{rest.join(' — ')}</p>}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => { setStep('camera'); setCapturedImage(null); }} className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-2">
              <RotateCcw size={14} />{t('retake')}
            </button>
            <button onClick={saveScan} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">{t('save_scan')}</button>
          </div>
        </div>
      )}

      <BottomNav />
      <SoleAssistant />
    </div>
  );
};

export default Scan;
