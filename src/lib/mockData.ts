export interface Patient {
  id: string;
  name: string;
  age: number;
  diabetes_type: string;
  diagnosis_year: number;
  baseline_established: boolean;
}

export interface ScanResult {
  id: string;
  patient_id: string;
  timestamp: string;
  grade: number;
  grade_label: string;
  overall_risk: number;
  heel: number;
  ball: number;
  arch: number;
  toe: number;
  confidence: number;
  probabilities: Record<string, number>;
  recommendations: string[];
  trend: string;
  trend_pct: number;
}

export interface CheckinRecord {
  id: string;
  patient_id: string;
  date: string;
  blood_sugar: number;
  steps: number;
  sleep_hours: number;
  sleep_quality: string;
  has_symptoms: boolean;
  symptom_zones: string[];
  symptom_type: string;
  severity: number;
  notes: string;
}

export interface Caregiver {
  id: string;
  patient_id: string;
  name: string;
  relation: string;
  contact: string;
  alert_threshold: number;
  alerts_enabled: boolean;
  last_alerted: string | null;
}

export interface AlertRecord {
  id: string;
  patient_id: string;
  caregiver_id: string;
  caregiver_name: string;
  timestamp: string;
  trigger_reason: string;
  risk_score: number;
  dismissed: boolean;
}

export const DEMO_PATIENT: Patient = {
  id: "demo",
  name: "Arjun Sharma",
  age: 58,
  diabetes_type: "Type 2",
  diagnosis_year: 2018,
  baseline_established: true,
};

const makeDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const gradeLabels: Record<number, string> = {
  1: "Superficial",
  2: "Deep Ulcer Risk",
  3: "Deep with Abscess",
  4: "Critical / Gangrene",
};

const makeRecs = (grade: number): string[] => {
  if (grade === 1) return [
    "Daily inspection — Check your foot each evening for any changes in color or texture.",
    "Proper footwear — Wear cushioned diabetic shoes that fit without pressure points.",
    "Blood sugar control — Maintaining target range reduces foot complication risk by up to 60%.",
  ];
  if (grade === 2) return [
    "Reduce pressure — Avoid standing more than 30 minutes continuously today.",
    "Medical review — Book an appointment with your podiatrist within the next 7 days.",
    "Wound care — Keep the affected area clean and dry. Do not self-treat with home remedies.",
  ];
  if (grade === 3) return [
    "Seek care today — This risk level requires clinical wound assessment within 24-48 hours.",
    "Offload completely — Avoid all weight bearing on the affected foot until assessed.",
    "Contact your doctor — Call your healthcare provider now and describe your symptoms.",
  ];
  return [
    "Emergency — Go to hospital emergency department immediately. Do not delay.",
    "Do not walk — Under no circumstances should you walk on this foot.",
    "Call for help — If you cannot travel, call emergency services or your doctor immediately.",
  ];
};

export const DEMO_SCANS: ScanResult[] = [
  { id: "s1", patient_id: "demo", timestamp: makeDate(19), grade: 1, grade_label: gradeLabels[1], overall_risk: 28, heel: 32, ball: 24, arch: 18, toe: 22, confidence: 91.2, probabilities: { "Grade 1": 91.2, "Grade 2": 5.3, "Grade 3": 2.8, "Grade 4": 0.7 }, recommendations: makeRecs(1), trend: "stable", trend_pct: 0 },
  { id: "s2", patient_id: "demo", timestamp: makeDate(18), grade: 1, grade_label: gradeLabels[1], overall_risk: 30, heel: 34, ball: 26, arch: 19, toe: 23, confidence: 89.8, probabilities: { "Grade 1": 89.8, "Grade 2": 6.1, "Grade 3": 3.2, "Grade 4": 0.9 }, recommendations: makeRecs(1), trend: "increasing", trend_pct: 7.1 },
  { id: "s3", patient_id: "demo", timestamp: makeDate(17), grade: 1, grade_label: gradeLabels[1], overall_risk: 32, heel: 35, ball: 28, arch: 20, toe: 25, confidence: 88.5, probabilities: { "Grade 1": 88.5, "Grade 2": 7.2, "Grade 3": 3.4, "Grade 4": 0.9 }, recommendations: makeRecs(1), trend: "increasing", trend_pct: 6.7 },
  { id: "s4", patient_id: "demo", timestamp: makeDate(15), grade: 1, grade_label: gradeLabels[1], overall_risk: 35, heel: 38, ball: 30, arch: 21, toe: 26, confidence: 85.3, probabilities: { "Grade 1": 85.3, "Grade 2": 9.4, "Grade 3": 4.1, "Grade 4": 1.2 }, recommendations: makeRecs(1), trend: "increasing", trend_pct: 9.4 },
  { id: "s5", patient_id: "demo", timestamp: makeDate(14), grade: 1, grade_label: gradeLabels[1], overall_risk: 38, heel: 42, ball: 33, arch: 22, toe: 28, confidence: 82.1, probabilities: { "Grade 1": 82.1, "Grade 2": 11.8, "Grade 3": 4.8, "Grade 4": 1.3 }, recommendations: makeRecs(1), trend: "increasing", trend_pct: 8.6 },
  { id: "s6", patient_id: "demo", timestamp: makeDate(12), grade: 2, grade_label: gradeLabels[2], overall_risk: 45, heel: 52, ball: 38, arch: 24, toe: 32, confidence: 72.4, probabilities: { "Grade 1": 18.3, "Grade 2": 72.4, "Grade 3": 7.5, "Grade 4": 1.8 }, recommendations: makeRecs(2), trend: "increasing", trend_pct: 18.4 },
  { id: "s7", patient_id: "demo", timestamp: makeDate(11), grade: 2, grade_label: gradeLabels[2], overall_risk: 48, heel: 55, ball: 40, arch: 25, toe: 34, confidence: 75.8, probabilities: { "Grade 1": 14.1, "Grade 2": 75.8, "Grade 3": 8.2, "Grade 4": 1.9 }, recommendations: makeRecs(2), trend: "increasing", trend_pct: 6.7 },
  { id: "s8", patient_id: "demo", timestamp: makeDate(10), grade: 2, grade_label: gradeLabels[2], overall_risk: 52, heel: 60, ball: 43, arch: 26, toe: 35, confidence: 78.2, probabilities: { "Grade 1": 11.2, "Grade 2": 78.2, "Grade 3": 8.8, "Grade 4": 1.8 }, recommendations: makeRecs(2), trend: "increasing", trend_pct: 8.3 },
  { id: "s9", patient_id: "demo", timestamp: makeDate(8), grade: 2, grade_label: gradeLabels[2], overall_risk: 55, heel: 64, ball: 45, arch: 27, toe: 36, confidence: 80.1, probabilities: { "Grade 1": 8.5, "Grade 2": 80.1, "Grade 3": 9.4, "Grade 4": 2.0 }, recommendations: makeRecs(2), trend: "increasing", trend_pct: 5.8 },
  { id: "s10", patient_id: "demo", timestamp: makeDate(7), grade: 2, grade_label: gradeLabels[2], overall_risk: 58, heel: 68, ball: 48, arch: 28, toe: 37, confidence: 81.5, probabilities: { "Grade 1": 6.2, "Grade 2": 81.5, "Grade 3": 10.1, "Grade 4": 2.2 }, recommendations: makeRecs(2), trend: "increasing", trend_pct: 5.5 },
  { id: "s11", patient_id: "demo", timestamp: makeDate(5), grade: 2, grade_label: gradeLabels[2], overall_risk: 62, heel: 72, ball: 51, arch: 24, toe: 38, confidence: 83.4, probabilities: { "Grade 1": 4.8, "Grade 2": 83.4, "Grade 3": 9.6, "Grade 4": 2.2 }, recommendations: makeRecs(2), trend: "increasing", trend_pct: 6.9 },
  { id: "s12", patient_id: "demo", timestamp: makeDate(3), grade: 2, grade_label: gradeLabels[2], overall_risk: 66, heel: 76, ball: 54, arch: 25, toe: 40, confidence: 85.1, probabilities: { "Grade 1": 3.5, "Grade 2": 85.1, "Grade 3": 9.2, "Grade 4": 2.2 }, recommendations: makeRecs(2), trend: "increasing", trend_pct: 6.5 },
  { id: "s13", patient_id: "demo", timestamp: makeDate(2), grade: 2, grade_label: gradeLabels[2], overall_risk: 70, heel: 80, ball: 58, arch: 23, toe: 41, confidence: 86.8, probabilities: { "Grade 1": 2.8, "Grade 2": 86.8, "Grade 3": 8.4, "Grade 4": 2.0 }, recommendations: makeRecs(2), trend: "increasing", trend_pct: 6.1 },
  { id: "s14", patient_id: "demo", timestamp: makeDate(1), grade: 2, grade_label: gradeLabels[2], overall_risk: 74, heel: 82, ball: 51, arch: 22, toe: 38, confidence: 87.3, probabilities: { "Grade 1": 5.2, "Grade 2": 87.3, "Grade 3": 6.1, "Grade 4": 1.4 }, recommendations: makeRecs(2), trend: "increasing", trend_pct: 5.7 },
];

export const DEMO_CHECKINS: CheckinRecord[] = [
  { id: "c1", patient_id: "demo", date: makeDate(18), blood_sugar: 118, steps: 6200, sleep_hours: 7, sleep_quality: "good", has_symptoms: false, symptom_zones: [], symptom_type: "", severity: 0, notes: "" },
  { id: "c2", patient_id: "demo", date: makeDate(15), blood_sugar: 135, steps: 5400, sleep_hours: 6.5, sleep_quality: "fair", has_symptoms: false, symptom_zones: [], symptom_type: "", severity: 0, notes: "" },
  { id: "c3", patient_id: "demo", date: makeDate(12), blood_sugar: 152, steps: 4100, sleep_hours: 6, sleep_quality: "fair", has_symptoms: false, symptom_zones: [], symptom_type: "", severity: 0, notes: "Felt tired" },
  { id: "c4", patient_id: "demo", date: makeDate(10), blood_sugar: 110, steps: 7800, sleep_hours: 7.5, sleep_quality: "good", has_symptoms: false, symptom_zones: [], symptom_type: "", severity: 0, notes: "" },
  { id: "c5", patient_id: "demo", date: makeDate(7), blood_sugar: 168, steps: 3200, sleep_hours: 5.5, sleep_quality: "poor", has_symptoms: false, symptom_zones: [], symptom_type: "", severity: 0, notes: "Stressful day" },
  { id: "c6", patient_id: "demo", date: makeDate(4), blood_sugar: 185, steps: 4500, sleep_hours: 6, sleep_quality: "fair", has_symptoms: true, symptom_zones: ["heel"], symptom_type: "Numbness", severity: 4, notes: "" },
  { id: "c7", patient_id: "demo", date: makeDate(1), blood_sugar: 142, steps: 5100, sleep_hours: 6.5, sleep_quality: "fair", has_symptoms: false, symptom_zones: [], symptom_type: "", severity: 0, notes: "" },
];

export const DEMO_CAREGIVERS: Caregiver[] = [
  { id: "cg1", patient_id: "demo", name: "Priya Sharma", relation: "Child", contact: "priya.s@email.com", alert_threshold: 70, alerts_enabled: true, last_alerted: makeDate(2) },
];

export const DEMO_ALERTS: AlertRecord[] = [
  { id: "a1", patient_id: "demo", caregiver_id: "cg1", caregiver_name: "Priya Sharma", timestamp: makeDate(3), trigger_reason: "Risk score reached 71 — above your threshold of 70", risk_score: 71, dismissed: false },
  { id: "a2", patient_id: "demo", caregiver_id: "cg1", caregiver_name: "Priya Sharma", timestamp: makeDate(2), trigger_reason: "3 consecutive scans showed increasing risk", risk_score: 74, dismissed: false },
];

export const DEMO_BASELINE = { heel_avg: 32, ball_avg: 28, arch_avg: 18, toe_avg: 24 };

export const CLINIC_PATIENTS: (Patient & { latestScan: ScanResult })[] = [
  { ...DEMO_PATIENT, latestScan: DEMO_SCANS[DEMO_SCANS.length - 1] },
  { id: "p2", name: "Meera Patel", age: 64, diabetes_type: "Type 2", diagnosis_year: 2015, baseline_established: true, latestScan: { id: "sp2", patient_id: "p2", timestamp: makeDate(0), grade: 1, grade_label: "Superficial", overall_risk: 28, heel: 30, ball: 25, arch: 20, toe: 22, confidence: 92.1, probabilities: { "Grade 1": 92.1, "Grade 2": 5.0, "Grade 3": 2.2, "Grade 4": 0.7 }, recommendations: makeRecs(1), trend: "stable", trend_pct: 1.2 } },
  { id: "p3", name: "Rajesh Kumar", age: 52, diabetes_type: "Type 1", diagnosis_year: 2010, baseline_established: true, latestScan: { id: "sp3", patient_id: "p3", timestamp: makeDate(1), grade: 3, grade_label: "Deep with Abscess", overall_risk: 82, heel: 88, ball: 75, arch: 45, toe: 62, confidence: 78.5, probabilities: { "Grade 1": 2.1, "Grade 2": 12.3, "Grade 3": 78.5, "Grade 4": 7.1 }, recommendations: makeRecs(3), trend: "increasing", trend_pct: 8.3 } },
  { id: "p4", name: "Sunita Devi", age: 71, diabetes_type: "Type 2", diagnosis_year: 2008, baseline_established: true, latestScan: { id: "sp4", patient_id: "p4", timestamp: makeDate(5), grade: 2, grade_label: "Deep Ulcer Risk", overall_risk: 55, heel: 62, ball: 48, arch: 30, toe: 38, confidence: 81.2, probabilities: { "Grade 1": 8.5, "Grade 2": 81.2, "Grade 3": 8.1, "Grade 4": 2.2 }, recommendations: makeRecs(2), trend: "stable", trend_pct: -1.5 } },
  { id: "p5", name: "Vikram Singh", age: 45, diabetes_type: "Pre-diabetic", diagnosis_year: 2022, baseline_established: true, latestScan: { id: "sp5", patient_id: "p5", timestamp: makeDate(2), grade: 1, grade_label: "Superficial", overall_risk: 18, heel: 20, ball: 15, arch: 12, toe: 14, confidence: 95.2, probabilities: { "Grade 1": 95.2, "Grade 2": 3.5, "Grade 3": 1.0, "Grade 4": 0.3 }, recommendations: makeRecs(1), trend: "falling", trend_pct: -3.2 } },
];

export function getGradeColor(grade: number): string {
  if (grade === 1) return 'text-grade-safe';
  if (grade === 2) return 'text-grade-watch';
  if (grade === 3) return 'text-grade-danger';
  return 'text-grade-critical';
}

export function getGradeBg(grade: number): string {
  if (grade === 1) return 'bg-grade-safe';
  if (grade === 2) return 'bg-grade-watch';
  if (grade === 3) return 'bg-grade-danger';
  return 'bg-grade-critical';
}

export function getRiskColor(score: number): string {
  if (score < 40) return 'text-grade-safe';
  if (score < 70) return 'text-grade-watch';
  if (score < 85) return 'text-grade-danger';
  return 'text-grade-critical';
}

export function getRiskBgColor(score: number): string {
  if (score < 40) return 'bg-grade-safe';
  if (score < 70) return 'bg-grade-watch';
  if (score < 85) return 'bg-grade-danger';
  return 'bg-grade-critical';
}
