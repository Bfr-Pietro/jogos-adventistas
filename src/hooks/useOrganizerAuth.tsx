
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrganizerSession {
  email: string;
  type: 'organizer' | 'sub_organizer';
  id?: string;
}

interface OrganizerAuthContextType {
  organizerSession: OrganizerSession | null;
  loginAsOrganizer: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsSubOrganizer: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutOrganizer: () => void;
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
  const { toast } = useToast();

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

  const loginAsOrganizer = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Main organizer check
    if (email === 'bfrpietro' && password === 'Pietro@123') {
      const session: OrganizerSession = {
        email: 'bfrpietro',
        type: 'organizer',
        id: 'organizer_bfrpietro'
      };
      setOrganizerSession(session);
      localStorage.setItem('organizerSession', JSON.stringify(session));
      return { success: true };
    }

    return { success: false, error: 'Credenciais inválidas' };
  };

  const loginAsSubOrganizer = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('sub_organizers')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const session: OrganizerSession = {
        email: data.email,
        type: 'sub_organizer',
        id: data.id
      };
      setOrganizerSession(session);
      localStorage.setItem('organizerSession', JSON.stringify(session));
      return { success: true };
    } catch (error) {
      console.error('Error during sub-organizer login:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const logoutOrganizer = () => {
    setOrganizerSession(null);
    localStorage.removeItem('organizerSession');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const getOrganizerSession = () => {
    return organizerSession;
  };

  const value = {
    organizerSession,
    loginAsOrganizer,
    loginAsSubOrganizer,
    logoutOrganizer,
    getOrganizerSession,
  };

  return (
    <OrganizerAuthContext.Provider value={value}>
      {children}
    </OrganizerAuthContext.Provider>
  );
};
