
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface OrganizerSession {
  email: string;
  type: 'organizer' | 'sub_organizer';
  id?: string;
}

interface OrganizerAuthContextType {
  organizerSession: OrganizerSession | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getOrganizerSession: () => OrganizerSession | null;
}

const OrganizerAuthContext = createContext<OrganizerAuthContextType | undefined>(undefined);

export const useOrganizerAuth = () => {
  const context = useContext(OrganizerAuthContext);
  if (context === undefined) {
    throw new Error('useOrganizerAuth must be used within an OrganizerAuthProvider');
  }
  return context;
};

interface OrganizerAuthProviderProps {
  children: ReactNode;
}

export const OrganizerAuthProvider = ({ children }: OrganizerAuthProviderProps) => {
  const [organizerSession, setOrganizerSession] = useState<OrganizerSession | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('organizerSession');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setOrganizerSession(parsed);
      } catch (error) {
        console.error('Error parsing saved organizer session:', error);
        localStorage.removeItem('organizerSession');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Main organizer check
    if (email === 'bfrpietro' && password === 'Pietro@123') {
      const session: OrganizerSession = {
        email: 'bfrpietro',
        type: 'organizer',
        id: 'main_organizer'
      };
      setOrganizerSession(session);
      localStorage.setItem('organizerSession', JSON.stringify(session));
      return true;
    }

    // Sub-organizer check would go here
    return false;
  };

  const logout = () => {
    setOrganizerSession(null);
    localStorage.removeItem('organizerSession');
  };

  const getOrganizerSession = () => {
    return organizerSession;
  };

  const value = {
    organizerSession,
    login,
    logout,
    getOrganizerSession,
  };

  return (
    <OrganizerAuthContext.Provider value={value}>
      {children}
    </OrganizerAuthContext.Provider>
  );
};
