import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ModelCard() {
  const [info, setInfo] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch('/api/model-info').then(r => r.json()).then(setInfo).catch(() => {})
  }, [open])

  return (
    <>
      {/* Floating badge — always visible */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-30 bg-surfaceHigh border border-border rounded-pill
                   px-3 py-1.5 text-xs font-medium text-textSec flex items-center gap-1.5
                   hover:border-teal hover:text-teal transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot inline-block" />
        MobileNetV2
      </button>

      {/* Full model card drawer */}
      {open && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full max-w-md mx-auto bg-surfaceHigh rounded-t-2xl border-t border-border
                          max-h-[85vh] overflow-y-auto fade-up">
            <div className="sticky top-0 bg-surfaceHigh border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Model Card</h2>
                <p className="text-textSec text-xs mt-0.5">Sole ML — Wagner Grade Classifier</p>
              </div>
              <button onClick={() => setOpen(false)}
                className="text-textSec text-xs border border-border rounded-pill px-3 py-1">
                Close
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!info ? (
                <div className="text-center py-8 text-textSec text-sm">Loading…</div>
              ) : (
                <>
                  {/* Status banner */}
                  <div className={`rounded-card p-3 flex items-center gap-3 border
                    ${info.status === 'trained'
                      ? 'bg-success/5 border-success/20'
                      : 'bg-warning/5 border-warning/20'}`}>
                    <span className="text-lg">{info.status === 'trained' ? '✅' : '⚙️'}</span>
                    <div>
                      <p className={`text-xs font-semibold ${info.status === 'trained' ? 'text-success' : 'text-warning'}`}>
                        {info.status === 'trained' ? 'Trained model loaded' : 'Using pre-trained backbone'}
                      </p>
                      {info.best_val_acc && (
                        <p className="text-textSec text-xs mt-0.5">
                          Best validation accuracy: <span className="text-success font-semibold">{info.best_val_acc}%</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Architecture */}
                  <Section title="Architecture">
                    <Row k="Backbone"     v={info.architecture} />
                    <Row k="Pretrained"   v={info.backbone} />
                    <Row k="Classifier"   v={info.classifier} />
                    <Row k="Input"        v={info.input_size} />
                    <Row k="Framework"    v={info.framework} />
                    <Row k="Reference"    v={info.clinical_reference} />
                  </Section>

                  {/* Dataset */}
                  <Section title="Dataset">
                    <Row k="Total images"   v={info.dataset_size?.toLocaleString()} />
                    <Row k="Split"          v={info.train_val_split} />
                    <Row k="Class balance"  v={info.class_balance} />
                    <div className="mt-2 space-y-1">
                      {info.classes?.map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${['bg-success','bg-warning','bg-danger','bg-violet'][i]}`} />
                          <span className="text-xs text-textSec">{c}</span>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Training */}
                  <Section title="Training">
                    <Row k="Loss"       v={info.loss} />
                    <Row k="Optimizer"  v={info.optimizer} />
                    <Row k="Scheduler"  v={info.scheduler} />
                    <Row k="Epochs"     v={info.epochs_trained > 0 ? `${info.epochs_trained} completed` : 'Pending'} />
                    <p className="text-textSec text-xs mt-2">Augmentations</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {info.augmentations?.map((a, i) => (
                        <span key={i} className="text-[10px] bg-bg border border-border rounded-pill px-2 py-0.5 text-textSec">
                          {a}
                        </span>
                      ))}
                    </div>
                  </Section>

                  {/* Training curve if available */}
                  {info.training_history?.length > 1 && (
                    <Section title="Training curve (last 5 epochs)">
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={info.training_history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                          <XAxis dataKey="epoch" tick={{ fill: '#8888A0', fontSize: 10 }} tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 1]} tick={{ fill: '#8888A0', fontSize: 10 }} tickLine={false} axisLine={false}
                                 tickFormatter={v => `${Math.round(v * 100)}%`} />
                          <Tooltip
                            contentStyle={{ background: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: 8, fontSize: 11 }}
                            formatter={v => [`${(v * 100).toFixed(1)}%`]}
                          />
                          <Line type="monotone" dataKey="train_acc" stroke="#14B8A6" strokeWidth={1.5} dot={false} name="Train Acc" />
                          <Line type="monotone" dataKey="val_acc"   stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Val Acc" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Section>
                  )}

                  {/* Validation note */}
                  <div className="card border-teal/20 space-y-1.5">
                    <p className="text-teal text-xs font-semibold">Clinical validation approach</p>
                    <p className="text-textSec text-xs leading-relaxed">
                      Sole uses personalised baseline tracking — risk scores are compared to each patient's own established baseline, not population averages. This makes the system sensitive to individual deterioration before clinical thresholds are crossed.
                    </p>
                    <p className="text-textSec text-xs leading-relaxed">
                      Camera-based pressure inference is a novel approach that requires clinical validation before deployment. This is acknowledged in the app's onboarding as a monitoring tool, not a diagnostic device.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-textSec text-xs uppercase tracking-widest">{title}</p>
      <div className="card space-y-2">{children}</div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-textSec text-xs shrink-0">{k}</span>
      <span className="text-textPri text-xs text-right leading-relaxed">{v || '—'}</span>
    </div>
  )
}