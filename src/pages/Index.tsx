
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Users, ExternalLink } from "lucide-react";
import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';
import Map from '@/components/Map';
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: number;
  type: string;
  address: string;
  date: string;
  time: string;
  status: 'Por acontecer' | 'Em andamento' | 'Encerrado';
  lat: number;
  lng: number;
  confirmed: string[];
}

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(user);
    }
    
    // Load events from localStorage or use defaults
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      setEvents(parsedEvents);
      if (parsedEvents.length > 0) {
        setSelectedEvent(parsedEvents[0]);
      }
    } else {
      const defaultEvents = [
        {
          id: 1,
          type: 'futebol',
          address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
          date: '2025-07-10',
          time: '19:00',
          status: 'Por acontecer' as const,
          lat: -23.5505,
          lng: -46.6333,
          confirmed: []
        },
        {
          id: 2,
          type: 'volei',
          address: 'Av. Paulista, 456 - Bela Vista, São Paulo - SP',
          date: '2025-07-12',
          time: '18:30',
          status: 'Por acontecer' as const,
          lat: -23.5618,
          lng: -46.6565,
          confirmed: []
        }
      ];
      setEvents(defaultEvents);
      setSelectedEvent(defaultEvents[0]);
    }
  }, []);

  const handleConfirmPresence = (eventId: number) => {
    if (!currentUser) {
      toast({
        title: "Login necessário",
        description: "Faça login para confirmar sua presença",
        variant: "destructive"
      });
      setIsLoginModalOpen(true);
      return;
    }

    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        const isAlreadyConfirmed = event.confirmed.includes(currentUser);
        const newConfirmed = isAlreadyConfirmed 
          ? event.confirmed.filter(user => user !== currentUser)
          : [...event.confirmed, currentUser];
        
        toast({
          title: isAlreadyConfirmed ? "Presença cancelada" : "Presença confirmada",
          description: isAlreadyConfirmed ? "Sua presença foi cancelada" : "Sua presença foi confirmada com sucesso!",
        });
        
        return { ...event, confirmed: newConfirmed };
      }
      return event;
    });

    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
  };

  const handleOpenGoogleMaps = (event: Event) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${event.lat},${event.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Por acontecer': return 'bg-blue-500';
      case 'Em andamento': return 'bg-green-500';
      case 'Encerrado': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getGameIcon = (type: string) => {
    if (type.includes('futebol') && type.includes('volei')) return '🏆';
    return type.includes('futebol') ? '⚽' : '🏐';
  };

  const getGameName = (type: string) => {
    const sports = type.split(',').map(sport => 
      sport.charAt(0).toUpperCase() + sport.slice(1)
    );
    return sports.join(' + ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} currentUser={currentUser} setCurrentUser={setCurrentUser} />
      
      <main className="container mx-auto px-4 pt-20">
        <div className="grid lg:grid-cols-2 gap-8 py-8">
          {/* Map Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Organize seus jogos com os amigos
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Encontre e participe dos melhores jogos de futebol e vôlei da sua região
              </p>
            </div>
            
            <Map events={events} selectedEvent={selectedEvent} onEventSelect={setSelectedEvent} />
          </div>

          {/* Event Details Section */}
          <div className="space-y-6">
            <div className="grid gap-4">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedEvent?.id === event.id ? 'ring-2 ring-green-500 shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <span className="text-2xl">{getGameIcon(event.type)}</span>
                        {getGameName(event.type)}
                      </CardTitle>
                      <Badge className={`${getStatusColor(event.status)} text-white`}>
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 mt-1 text-green-600" />
                      <span className="text-sm">{event.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-green-600" />
                        <span>{event.confirmed.length} confirmados</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {event.status === 'Por acontecer' && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmPresence(event.id);
                          }}
                          className={`flex-1 transition-all duration-300 ${
                            currentUser && event.confirmed.includes(currentUser)
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                          }`}
                        >
                          {currentUser && event.confirmed.includes(currentUser) 
                            ? 'Cancelar Presença' 
                            : 'Confirmar Presença'
                          }
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenGoogleMaps(event);
                        }}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Google Maps
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onUserLogin={setCurrentUser}
      />
    </div>
  );
};

export default Index;
