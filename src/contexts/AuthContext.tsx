import React, { createContext, useContext, useState } from 'react';
import type { Patient } from '@/lib/mockData';
import { DEMO_PATIENT } from '@/lib/mockData';

interface AuthContextType {
  patient: Patient | null;
  isClinicianLoggedIn: boolean;
  loginAsPatient: (p: Patient) => void;
  loginAsDemo: () => void;
  loginAsClinician: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  patient: null,
  isClinicianLoggedIn: false,
  loginAsPatient: () => {},
  loginAsDemo: () => {},
  loginAsClinician: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isClinicianLoggedIn, setClinicianLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={{
      patient,
      isClinicianLoggedIn,
      loginAsPatient: (p) => setPatient(p),
      loginAsDemo: () => setPatient(DEMO_PATIENT),
      loginAsClinician: () => setClinicianLoggedIn(true),
      logout: () => { setPatient(null); setClinicianLoggedIn(false); },
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
