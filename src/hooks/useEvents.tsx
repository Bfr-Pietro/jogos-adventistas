
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganizerAuth } from './useOrganizerAuth';
import { useToast } from './use-toast';

interface Event {
  id: string;
  type: string;
  address: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  confirmed?: string[];
}

interface CreateEventData {
  type: string;
  address: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
}

export const useEvents = () => {
  const { user } = useAuth();
  const { organizerSession } = useOrganizerAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      console.log('Fetching events...');
      
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw eventsError;
      }

      // Fetch confirmations for each event
      const eventsWithConfirmations = await Promise.all(
        eventsData.map(async (event) => {
          const { data: confirmations, error: confirmError } = await supabase
            .from('event_confirmations')
            .select('user_id')
            .eq('event_id', event.id);

          if (confirmError) {
            console.error('Error fetching confirmations:', confirmError);
            return { ...event, confirmed: [] };
          }

          // Get user profiles for confirmed users
          const confirmedUsers = await Promise.all(
            confirmations.map(async (confirmation) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', confirmation.user_id)
                .single();

              return profile?.username || confirmation.user_id.split('@')[0] || 'Usuário';
            })
          );

          return {
            ...event,
            confirmed: confirmedUsers
          };
        })
      );

      console.log('Events with confirmations:', eventsWithConfirmations);
      return eventsWithConfirmations;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      console.log('Creating event with data:', eventData);
      
      // Get the current user ID for created_by
      let createdBy = '';
      
      if (organizerSession) {
        // For organizers, use their session ID
        createdBy = organizerSession.id || 'organizer_bfrpietro';
      } else if (user) {
        // For regular users, use their user ID
        createdBy = user.id;
      } else {
        throw new Error('User not authenticated');
      }

      console.log('Created by:', createdBy);

      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            ...eventData,
            created_by: createdBy,
            status: 'Por acontecer'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        throw error;
      }

      console.log('Event created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Sucesso!",
        description: "Evento criado com sucesso",
      });
    },
    onError: (error: any) => {
      console.error('Error creating event:', error);
      toast({
        title: "Erro ao criar evento",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const confirmPresenceMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user is already confirmed
      const { data: existingConfirmation } = await supabase
        .from('event_confirmations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingConfirmation) {
        // Remove confirmation
        const { error } = await supabase
          .from('event_confirmations')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add confirmation
        const { error } = await supabase
          .from('event_confirmations')
          .insert([
            {
              event_id: eventId,
              user_id: user.id
            }
          ]);

        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: result.action === 'added' ? "Presença confirmada!" : "Presença cancelada",
        description: result.action === 'added' 
          ? "Sua presença foi confirmada para este evento" 
          : "Sua presença foi cancelada",
      });
    },
    onError: (error: any) => {
      console.error('Error confirming presence:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  return {
    events,
    loading,
    refetch,
    createEvent: createEventMutation.mutate,
    confirmPresence: confirmPresenceMutation.mutate,
    isCreating: createEventMutation.isPending,
    isConfirming: confirmPresenceMutation.isPending,
  };
};
