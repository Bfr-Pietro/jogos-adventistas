
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  type: string;
  address: string;
  date: string;
  time: string;
  status: 'Por acontecer' | 'Em andamento' | 'Encerrado';
  lat: number;
  lng: number;
  created_by: string;
  created_at: string;
  confirmed: string[];
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Simple query without complex joins to avoid LockManager issues
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw new Error('Erro ao carregar eventos');
      }

      if (!eventsData) {
        setEvents([]);
        return;
      }

      // Fetch confirmations separately and safely
      let confirmationsByEvent: Record<string, string[]> = {};
      
      try {
        const { data: confirmationsData } = await supabase
          .from('event_confirmations')
          .select(`
            event_id,
            profiles!event_confirmations_user_id_fkey(username)
          `);

        if (confirmationsData) {
          confirmationsByEvent = confirmationsData.reduce((acc: Record<string, string[]>, confirmation: any) => {
            const eventId = confirmation.event_id;
            if (!acc[eventId]) acc[eventId] = [];
            if (confirmation.profiles?.username) {
              acc[eventId].push(confirmation.profiles.username);
            }
            return acc;
          }, {} as Record<string, string[]>);
        }
      } catch (confirmError) {
        console.warn('Could not fetch confirmations:', confirmError);
        // Continue without confirmations rather than failing
      }

      // Combine events with confirmations
      const eventsWithConfirmations = eventsData.map((event: any) => ({
        ...event,
        confirmed: confirmationsByEvent[event.id] || []
      }));

      setEvents(eventsWithConfirmations);
    } catch (error: any) {
      console.error('Error in fetchEvents:', error);
      toast({
        title: "Erro ao carregar eventos",
        description: "Tente recarregar a página",
        variant: "destructive"
      });
      setEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const confirmPresence = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para confirmar presença",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already confirmed
      const { data: existing, error: checkError } = await supabase
        .from('event_confirmations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking confirmation:', checkError);
        throw new Error('Erro ao verificar confirmação');
      }

      if (existing) {
        // Remove confirmation
        const { error } = await supabase
          .from('event_confirmations')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing confirmation:', error);
          throw new Error('Erro ao cancelar presença');
        }

        toast({
          title: "Presença cancelada",
          description: "Sua presença foi cancelada com sucesso",
        });
      } else {
        // Add confirmation
        const { error } = await supabase
          .from('event_confirmations')
          .insert({
            event_id: eventId,
            user_id: user.id
          });

        if (error) {
          console.error('Error adding confirmation:', error);
          throw new Error('Erro ao confirmar presença');
        }

        toast({
          title: "Presença confirmada",
          description: "Sua presença foi confirmada com sucesso!",
        });
      }

      // Refresh events
      await fetchEvents();
    } catch (error: any) {
      console.error('Error in confirmPresence:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEvents();

    // Set up real-time subscriptions with error handling
    let eventsSubscription: any;
    let confirmationsSubscription: any;

    try {
      eventsSubscription = supabase
        .channel('events-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'events'
        }, () => {
          fetchEvents();
        })
        .subscribe();

      confirmationsSubscription = supabase
        .channel('confirmations-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'event_confirmations'
        }, () => {
          fetchEvents();
        })
        .subscribe();
    } catch (subscriptionError) {
      console.warn('Could not set up real-time subscriptions:', subscriptionError);
    }

    return () => {
      try {
        if (eventsSubscription) supabase.removeChannel(eventsSubscription);
        if (confirmationsSubscription) supabase.removeChannel(confirmationsSubscription);
      } catch (cleanupError) {
        console.warn('Error cleaning up subscriptions:', cleanupError);
      }
    };
  }, []);

  return {
    events,
    loading,
    confirmPresence,
    refetch: fetchEvents
  };
};
