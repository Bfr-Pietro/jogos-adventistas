
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, validateEmail } from '@/utils/validation';

export interface OrganizerLoginResult {
  success: boolean;
  userType: 'organizer' | 'sub-organizer' | null;
  userData?: any;
}

export const useOrganizerAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loginAsOrganizer = async (email: string, password: string): Promise<OrganizerLoginResult> => {
    setLoading(true);
    
    try {
      // Check if it's the main organizer
      if (email === 'bfrpietro' && password === '190615') {
        // Store organizer session in localStorage
        localStorage.setItem('organizer_session', JSON.stringify({
          type: 'organizer',
          email: 'bfrpietro',
          loginTime: Date.now()
        }));
        
        toast({
          title: "Sucesso",
          description: "Login de organizador realizado com sucesso!",
        });
        
        return {
          success: true,
          userType: 'organizer',
          userData: { email: 'bfrpietro' }
        };
      } else {
        toast({
          title: "Erro",
          description: "Credenciais de organizador incorretas",
          variant: "destructive"
        });
        
        return {
          success: false,
          userType: null
        };
      }
    } catch (error: any) {
      console.error('Error in organizer login:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer login como organizador",
        variant: "destructive"
      });
      
      return {
        success: false,
        userType: null
      };
    } finally {
      setLoading(false);
    }
  };

  const loginAsSubOrganizer = async (email: string, password: string): Promise<OrganizerLoginResult> => {
    setLoading(true);
    
    try {
      if (!validateEmail(email)) {
        toast({
          title: "Erro",
          description: "Email inválido",
          variant: "destructive"
        });
        return { success: false, userType: null };
      }

      // Check sub-organizers table
      const { data, error } = await supabase
        .from('sub_organizers')
        .select('*')
        .eq('email', sanitizeInput(email))
        .eq('password', sanitizeInput(password))
        .maybeSingle();

      if (error) {
        console.error('Error checking sub-organizer:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar credenciais",
          variant: "destructive"
        });
        return { success: false, userType: null };
      }

      if (data) {
        // Store sub-organizer session in localStorage
        localStorage.setItem('organizer_session', JSON.stringify({
          type: 'sub-organizer',
          email: data.email,
          id: data.id,
          loginTime: Date.now()
        }));
        
        toast({
          title: "Sucesso",
          description: "Login de sub-organizador realizado com sucesso!",
        });
        
        return {
          success: true,
          userType: 'sub-organizer',
          userData: data
        };
      } else {
        toast({
          title: "Erro",
          description: "Email ou senha de sub-organizador incorretos",
          variant: "destructive"
        });
        
        return {
          success: false,
          userType: null
        };
      }
    } catch (error: any) {
      console.error('Error in sub-organizer login:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer login como sub-organizador",
        variant: "destructive"
      });
      
      return {
        success: false,
        userType: null
      };
    } finally {
      setLoading(false);
    }
  };

  const logoutOrganizer = () => {
    localStorage.removeItem('organizer_session');
    toast({
      title: "Logout realizado",
      description: "Sessão de organizador encerrada",
    });
  };

  const getOrganizerSession = () => {
    try {
      const session = localStorage.getItem('organizer_session');
      if (session) {
        const parsed = JSON.parse(session);
        // Check if session is not too old (24 hours)
        if (Date.now() - parsed.loginTime < 24 * 60 * 60 * 1000) {
          return parsed;
        } else {
          localStorage.removeItem('organizer_session');
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  return {
    loading,
    loginAsOrganizer,
    loginAsSubOrganizer,
    logoutOrganizer,
    getOrganizerSession
  };
};
