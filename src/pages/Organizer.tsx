
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Event {
  id: number;
  type: 'futebol' | 'volei';
  address: string;
  date: string;
  time: string;
  status: 'Por acontecer' | 'Em andamento' | 'Encerrado';
  lat: number;
  lng: number;
  confirmed: string[];
}

interface User {
  username: string;
  password: string;
}

const Organizer = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    type: 'futebol' as 'futebol' | 'volei',
    address: '',
    date: '',
    time: '',
    status: 'Por acontecer' as 'Por acontecer' | 'Em andamento' | 'Encerrado'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is organizer
    const userType = localStorage.getItem('userType');
    if (userType !== 'organizer') {
      navigate('/');
      return;
    }

    // Load initial data
    loadEvents();
    loadUsers();
  }, [navigate]);

  const loadEvents = () => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      // Initialize with default events
      const defaultEvents = [
        {
          id: 1,
          type: 'futebol' as const,
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
          type: 'volei' as const,
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
      localStorage.setItem('events', JSON.stringify(defaultEvents));
    }
  };

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  };

  const handleSaveEvent = () => {
    if (!eventForm.address || !eventForm.date || !eventForm.time) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const newEvent: Event = {
      id: editingEvent?.id || Date.now(),
      ...eventForm,
      lat: -23.5505 + (Math.random() - 0.5) * 0.1,
      lng: -46.6333 + (Math.random() - 0.5) * 0.1,
      confirmed: editingEvent?.confirmed || []
    };

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map(event => event.id === editingEvent.id ? newEvent : event);
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!"
      });
    } else {
      updatedEvents = [...events, newEvent];
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!"
      });
    }

    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setEventForm({
      type: 'futebol',
      address: '',
      date: '',
      time: '',
      status: 'Por acontecer'
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    toast({
      title: "Sucesso",
      description: "Evento excluído com sucesso!"
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      type: event.type,
      address: event.address,
      date: event.date,
      time: event.time,
      status: event.status
    });
    setIsEventModalOpen(true);
  };

  const generateWhatsAppMessage = (event: Event) => {
    const confirmed = event.confirmed;
    const absent = users.filter(user => !confirmed.includes(user.username));
    
    const message = `🏆 *${event.type.toUpperCase()} - ${new Date(event.date).toLocaleDateString('pt-BR')}*
    
📍 *Local:* ${event.address}
⏰ *Horário:* ${event.time}

✅ *CONFIRMADOS (${confirmed.length}):*
${confirmed.map(name => `• ${name}`).join('\n')}

❌ *AUSENTES (${absent.length}):*
${absent.map(user => `• ${user.username}`).join('\n')}

Vamos jogar! 🔥`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Por acontecer': return 'bg-blue-500';
      case 'Em andamento': return 'bg-green-500';
      case 'Encerrado': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel do Organizador</h1>
              <p className="text-gray-600">Gerencie eventos e usuários</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-fit">
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Gerenciar Eventos</h2>
              <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Tipo de Jogo</Label>
                      <Select
                        value={eventForm.type}
                        onValueChange={(value: 'futebol' | 'volei') => 
                          setEventForm(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="futebol">⚽ Futebol</SelectItem>
                          <SelectItem value="volei">🏐 Vôlei</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={eventForm.address}
                        onChange={(e) => setEventForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Endereço completo"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Data</Label>
                        <Input
                          id="date"
                          type="date"
                          value={eventForm.date}
                          onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Horário</Label>
                        <Input
                          id="time"
                          type="time"
                          value={eventForm.time}
                          onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={eventForm.status}
                        onValueChange={(value: 'Por acontecer' | 'Em andamento' | 'Encerrado') => 
                          setEventForm(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Por acontecer">Por acontecer</SelectItem>
                          <SelectItem value="Em andamento">Em andamento</SelectItem>
                          <SelectItem value="Encerrado">Encerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSaveEvent} className="w-full">
                      {editingEvent ? 'Atualizar Evento' : 'Criar Evento'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">
                          {event.type === 'futebol' ? '⚽' : '🏐'}
                        </span>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(event.status)} text-white`}>
                          {event.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Endereço:</strong> {event.address}</p>
                      <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}</p>
                      <div className="flex items-center justify-between">
                        <p className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <strong>{event.confirmed.length} confirmados</strong>
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateWhatsAppMessage(event)}
                          className="text-green-600"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                      {event.confirmed.length > 0 && (
                        <div className="mt-2">
                          <strong>Confirmados:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.confirmed.map((user, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {user}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-semibold">Usuários Cadastrados</h2>
            
            <div className="grid gap-4">
              {users.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Nenhum usuário cadastrado ainda
                  </CardContent>
                </Card>
              ) : (
                users.map((user, index) => (
                  <Card key={index}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-gray-500">Senha: {user.password}</p>
                        </div>
                        <Badge variant="outline">Cliente</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Organizer;
