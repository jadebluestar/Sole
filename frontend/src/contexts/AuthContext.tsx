import React, { createContext, useContext, useState, useCallback } from 'react';
import { PatientAPI } from '@/lib/api';
import type { Patient } from '@/lib/mockData';

interface AuthContextType {
  patient: Patient | null;
  isClinicianLoggedIn: boolean;
  clinicianPassword: string | null;
  loading: boolean;
  error: string | null;
  loginAsPatient: (patientId: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  loginAsClinician: (password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  patient: null,
  isClinicianLoggedIn: false,
  clinicianPassword: null,
  loading: false,
  error: null,
  loginAsPatient: async () => {},
  loginAsDemo: async () => {},
  loginAsClinician: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isClinicianLoggedIn, setClinicianLoggedIn] = useState(false);
  const [clinicianPassword, setClinicianPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginAsPatient = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const patientData = await PatientAPI.get(patientId);
      setPatient(patientData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsDemo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const patientData = await PatientAPI.get('demo');
      setPatient(patientData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Demo load failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsClinician = useCallback((password: string) => {
    setClinicianLoggedIn(true);
    setClinicianPassword(password);
  }, []);

  const logout = useCallback(() => {
    setPatient(null);
    setClinicianLoggedIn(false);
    setClinicianPassword(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        patient,
        isClinicianLoggedIn,
        clinicianPassword,
        loading,
        error,
        loginAsPatient,
        loginAsDemo,
        loginAsClinician,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
