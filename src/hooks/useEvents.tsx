
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
      // Fetch events using any type to bypass type checking
      const { data: eventsData, error: eventsError } = await (supabase as any)
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch confirmations using any type
      const { data: confirmationsData, error: confirmationsError } = await (supabase as any)
        .from('event_confirmations')
        .select(`
          event_id,
          profiles!event_confirmations_user_id_fkey(username)
        `);

      if (confirmationsError) throw confirmationsError;

      // Group confirmations by event
      const confirmationsByEvent = confirmationsData?.reduce((acc: any, confirmation: any) => {
        const eventId = confirmation.event_id;
        if (!acc[eventId]) acc[eventId] = [];
        acc[eventId].push(confirmation.profiles?.username);
        return acc;
      }, {} as Record<string, string[]>) || {};

      // Combine events with confirmations
      const eventsWithConfirmations = eventsData?.map((event: any) => ({
        ...event,
        confirmed: confirmationsByEvent[event.id] || []
      })) || [];

      setEvents(eventsWithConfirmations);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmPresence = async (eventId: string) => {
    if (!user) return;

    try {
      // Check if already confirmed using any type
      const { data: existing } = await (supabase as any)
        .from('event_confirmations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Remove confirmation
        const { error } = await (supabase as any)
          .from('event_confirmations')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Presença cancelada",
          description: "Sua presença foi cancelada com sucesso",
        });
      } else {
        // Add confirmation
        const { error } = await (supabase as any)
          .from('event_confirmations')
          .insert({
            event_id: eventId,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "Presença confirmada",
          description: "Sua presença foi confirmada com sucesso!",
        });
      }

      // Refresh events
      fetchEvents();
    } catch (error: any) {
      console.error('Error confirming presence:', error);
      toast({
        title: "Erro",
        description: error.message,
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
