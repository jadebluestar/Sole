/**
 * Sole Frontend — API Client
 * Handles all communication with Sole backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new APIError(response.status, error.message || error.error);
  }
  
  return response.json();
}

// ─── Patient Endpoints ────────────────────────────────────────────────────────

export const PatientAPI = {
  create: (data: {
    patient_id: string;
    name: string;
    age: number;
    diabetes_type: string;
    diagnosis_year: number;
  }) => request('POST', '/patient', data),
  
  get: (patientId: string) => request('GET', `/patient/${patientId}`),
  
  getSummary: (patientId: string) => request('GET', `/patient/${patientId}/summary`),
};

// ─── Scan Endpoints ──────────────────────────────────────────────────────────

export const ScanAPI = {
  upload: (data: { patient_id: string; image: string }) =>
    request('POST', '/scan', data),
  
  getHistory: (patientId: string, days: number = 30) =>
    request('GET', `/patient/${patientId}/history?days=${days}`),
};

// ─── Check-in Endpoints ──────────────────────────────────────────────────────

export const CheckinAPI = {
  save: (data: {
    patient_id: string;
    blood_sugar?: number;
    steps?: number;
    sleep_hours?: number;
    sleep_quality?: string;
    has_symptoms?: boolean;
    symptom_zones?: string[];
    symptom_type?: string;
    severity?: number;
    notes?: string;
  }) => request('POST', '/checkin', data),
  
  update: (checkinId: number, data: unknown) =>
    request('PUT', `/checkin/${checkinId}`, data),
  
  getHistory: (patientId: string, days: number = 30) =>
    request('GET', `/patient/${patientId}/checkins?days=${days}`),
};

// ─── Caregiver Endpoints ─────────────────────────────────────────────────────

export const CaregiverAPI = {
  add: (data: {
    patient_id: string;
    name: string;
    relation: string;
    contact: string;
    alert_threshold?: number;
  }) => request('POST', '/caregiver', data),
  
  update: (caregiverId: number, data: unknown) =>
    request('PUT', `/caregiver/${caregiverId}`, data),
  
  delete: (caregiverId: number) =>
    request('DELETE', `/caregiver/${caregiverId}`),
  
  list: (patientId: string) =>
    request('GET', `/patient/${patientId}/caregivers`),
};

// ─── Alert Endpoints ─────────────────────────────────────────────────────────

export const AlertAPI = {
  getHistory: (patientId: string) =>
    request('GET', `/patient/${patientId}/alerts`),
};

// ─── AI Assistant Endpoints ──────────────────────────────────────────────────

export const ChatAPI = {
  send: (patientId: string, message: string) =>
    request('POST', '/chat', { patient_id: patientId, message }),
};

// ─── Clinician Endpoints ─────────────────────────────────────────────────────

export const ClinicAPI = {
  getAllPatients: (password: string = 'sole2026') =>
    request('GET', '/clinic/patients', undefined, { 'X-Clinic-Auth': password }),
  
  getPatientDetail: (patientId: string, password: string = 'sole2026') =>
    request('GET', `/clinic/patient/${patientId}`, undefined, { 'X-Clinic-Auth': password }),
};

// ─── Health Check ────────────────────────────────────────────────────────────

export const HealthAPI = {
  check: () => request('GET', '/health'),
};
