
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, sanitizeInput } from '@/utils/validation';

export interface SubOrganizer {
  id: string;
  email: string;
  password: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useSubOrganizers = () => {
  const [subOrganizers, setSubOrganizers] = useState<SubOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSubOrganizers = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_organizers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sub-organizers:', error);
        throw new Error('Erro ao carregar sub-organizadores');
      }

      setSubOrganizers(data || []);
    } catch (error: any) {
      console.error('Error in fetchSubOrganizers:', error);
      toast({
        title: "Erro ao carregar sub-organizadores",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubOrganizer = async (email: string, password: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado como organizador",
        variant: "destructive"
      });
      return false;
    }

    // Validate input
    if (!validateEmail(email)) {
      toast({
        title: "Erro",
        description: "Email inválido",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('sub_organizers')
        .insert({
          email: sanitizeInput(email),
          password: sanitizeInput(password),
          created_by: user.id
        });

      if (error) {
        console.error('Error adding sub-organizer:', error);
        if (error.code === '23505') {
          toast({
            title: "Erro",
            description: "Este email já está cadastrado como sub-organizador",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro",
            description: "Erro ao adicionar sub-organizador",
            variant: "destructive"
          });
        }
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Sub-organizador adicionado com sucesso!",
      });
      
      fetchSubOrganizers();
      return true;
    } catch (error: any) {
      console.error('Error in addSubOrganizer:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeSubOrganizer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sub_organizers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing sub-organizer:', error);
        throw new Error('Erro ao remover sub-organizador');
      }

      toast({
        title: "Sucesso",
        description: "Sub-organizador removido com sucesso!",
      });
      
      fetchSubOrganizers();
    } catch (error: any) {
      console.error('Error in removeSubOrganizer:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubOrganizers();
    }
  }, [user]);

  return {
    subOrganizers,
    loading,
    addSubOrganizer,
    removeSubOrganizer,
    refetch: fetchSubOrganizers
  };
};
