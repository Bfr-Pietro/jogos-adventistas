
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Save, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { validateEventData, sanitizeInput } from '@/utils/validation';
import { useOrganizerAuth } from '@/hooks/useOrganizerAuth';
import Map from '@/components/Map';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

const CreateEventModal = ({ isOpen, onClose, onEventCreated }: CreateEventModalProps) => {
  const [formData, setFormData] = useState({
    type: '',
    address: '',
    date: '',
    time: '',
    lat: -23.5505,
    lng: -46.6333
  });
  const [isFutebol, setIsFutebol] = useState(false);
  const [isVolei, setIsVolei] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();
  const { getOrganizerSession } = useOrganizerAuth();

  const handleSportChange = (sport: string, checked: boolean) => {
    if (sport === 'futebol') {
      setIsFutebol(checked);
    } else if (sport === 'volei') {
      setIsVolei(checked);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    setShowMap(false);
    toast({
      title: "Localização selecionada",
      description: "Local do evento atualizado no mapa",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate sports selection
    if (!isFutebol && !isVolei) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um esporte",
        variant: "destructive"
      });
      return;
    }

    // Check organizer session
    const organizerSession = getOrganizerSession();
    if (!organizerSession) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado como organizador para criar eventos",
        variant: "destructive"
      });
      return;
    }

    // Prepare sports data
    const sports = [];
    if (isFutebol) sports.push('futebol');
    if (isVolei) sports.push('volei');
    
    const eventData = {
      ...formData,
      type: sports.join(','),
      address: sanitizeInput(formData.address)
    };

    // Enhanced date validation - allow today's date
    const selectedDate = new Date(eventData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast({
        title: "Erro de validação",
        description: "A data do evento deve ser hoje ou no futuro",
        variant: "destructive"
      });
      return;
    }

    // Validate all event data
    const validation = validateEventData(eventData);
    if (!validation.isValid) {
      toast({
        title: "Erro de validação",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create organizer user ID - improved security
      const organizerUserId = `org_${organizerSession.type}_${organizerSession.email.replace(/[^a-zA-Z0-9]/g, '_')}`;

      console.log('Creating event with organizer ID:', organizerUserId);

      const { data, error } = await supabase.from('events').insert({
        type: eventData.type,
        address: eventData.address,
        date: eventData.date,
        time: eventData.time,
        lat: eventData.lat,
        lng: eventData.lng,
        created_by: organizerUserId,
        status: 'Por acontecer'
      }).select();

      if (error) {
        console.error('Supabase error creating event:', error);
        toast({
          title: "Erro",
          description: `Erro ao criar evento: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Event created successfully:', data);

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!",
      });

      // Reset form
      setFormData({
        type: '',
        address: '',
        date: '',
        time: '',
        lat: -23.5505,
        lng: -46.6333
      });
      setIsFutebol(false);
      setIsVolei(false);
      
      onEventCreated();
      onClose();

    } catch (error: any) {
      console.error('Unexpected error creating event:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar evento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Criar Novo Evento
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo de Esporte</Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="futebol"
                  checked={isFutebol}
                  onCheckedChange={(checked) => handleSportChange('futebol', checked as boolean)}
                />
                <Label htmlFor="futebol">⚽ Futebol</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="volei"
                  checked={isVolei}
                  onCheckedChange={(checked) => handleSportChange('volei', checked as boolean)}
                />
                <Label htmlFor="volei">🏐 Vôlei</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Digite o endereço do evento"
                className="pl-10"
                required
                maxLength={200}
              />
            </div>
          </div>

          <div>
            <Label>Localização no Mapa</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMap(!showMap)}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {showMap ? 'Ocultar Mapa' : 'Selecionar no Mapa'}
              </Button>
              {showMap && (
                <div className="border rounded-lg p-2">
                  <Map
                    events={[]}
                    selectedEvent={null}
                    onEventSelect={() => {}}
                    isEditing={true}
                    onLocationSelect={handleLocationSelect}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Coordenadas: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Evento
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
