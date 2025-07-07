
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
      // Fetch events with proper error handling
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw new Error('Erro ao carregar eventos');
      }

      // Fetch confirmations with proper error handling
      const { data: confirmationsData, error: confirmationsError } = await supabase
        .from('event_confirmations')
        .select(`
          event_id,
          profiles!event_confirmations_user_id_fkey(username)
        `);

      if (confirmationsError) {
        console.error('Error fetching confirmations:', confirmationsError);
        // Don't throw here, just log the error and continue without confirmations
      }

      // Group confirmations by event
      const confirmationsByEvent = confirmationsData?.reduce((acc: Record<string, string[]>, confirmation: any) => {
        const eventId = confirmation.event_id;
        if (!acc[eventId]) acc[eventId] = [];
        if (confirmation.profiles?.username) {
          acc[eventId].push(confirmation.profiles.username);
        }
        return acc;
      }, {} as Record<string, string[]>) || {};

      // Combine events with confirmations
      const eventsWithConfirmations = eventsData?.map((event: any) => ({
        ...event,
        confirmed: confirmationsByEvent[event.id] || []
      })) || [];

      setEvents(eventsWithConfirmations);
    } catch (error: any) {
      console.error('Error in fetchEvents:', error);
      toast({
        title: "Erro ao carregar eventos",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
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
      fetchEvents();
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

    // Set up real-time subscriptions
    const eventsSubscription = supabase
      .channel('events-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events'
      }, () => {
        fetchEvents();
      })
      .subscribe();

    const confirmationsSubscription = supabase
      .channel('confirmations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_confirmations'
      }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
      supabase.removeChannel(confirmationsSubscription);
    };
  }, []);

  return {
    events,
    loading,
    confirmPresence,
    refetch: fetchEvents
  };
};
