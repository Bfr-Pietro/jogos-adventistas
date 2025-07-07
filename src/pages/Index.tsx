
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Users, ExternalLink, LogOut } from "lucide-react";
import AuthModal from '@/components/AuthModal';
import Map from '@/components/Map';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { sanitizeInput } from '@/utils/validation';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { user, loading: authLoading, signOut } = useAuth();
  const { events, loading: eventsLoading, confirmPresence } = useEvents();

  const handleConfirmPresence = async (eventId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    await confirmPresence(eventId);
  };

  const handleOpenGoogleMaps = (event: any) => {
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

  const isUserConfirmed = (event: any) => {
    if (!user) return false;
    
    // Get user's profile data to check confirmation
    const userProfile = user.email?.split('@')[0] || '';
    return event.confirmed?.includes(userProfile);
  };

  if (authLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-green-600">🏆 Jogos</div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Olá, {sanitizeInput(user.email?.split('@')[0] || 'Usuário')}!
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Entrar
              </Button>
            )}
          </div>
        </header>

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
              {events.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Nenhum evento encontrado
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
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
                        <span className="text-sm">{sanitizeInput(event.address)}</span>
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
                          <span>{event.confirmed?.length || 0} confirmados</span>
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
                              isUserConfirmed(event)
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                            }`}
                          >
                            {isUserConfirmed(event)
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Index;
