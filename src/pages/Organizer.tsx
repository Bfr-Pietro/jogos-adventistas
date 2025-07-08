import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, MessageCircle, ArrowLeft, MapPin, UserPlus, Calendar } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useSubOrganizers } from '@/hooks/useSubOrganizers';
import { useOrganizerAuth } from '@/hooks/useOrganizerAuth';
import CreateEventModal from '@/components/CreateEventModal';
import UsersTable from '@/components/UsersTable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import Map from '@/components/Map';

const Organizer = () => {
  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents();
  const { subOrganizers, loading: subOrganizersLoading, addSubOrganizer, removeSubOrganizer } = useSubOrganizers();
  const { logoutOrganizer, getOrganizerSession } = useOrganizerAuth();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSubOrganizerModalOpen, setIsSubOrganizerModalOpen] = useState(false);
  const [subOrganizerForm, setSubOrganizerForm] = useState({ email: '', password: '' });
  const [organizerSession, setOrganizerSession] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const session = getOrganizerSession();
    if (!session) {
      navigate('/');
      return;
    }
    setOrganizerSession(session);
  }, [navigate, getOrganizerSession]);

  const handleLogout = () => {
    logoutOrganizer();
    navigate('/');
  };

  const handleAddSubOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subOrganizerForm.email || !subOrganizerForm.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const success = await addSubOrganizer(subOrganizerForm.email, subOrganizerForm.password);
    if (success) {
      setIsSubOrganizerModalOpen(false);
      setSubOrganizerForm({ email: '', password: '' });
    }
  };

  const handleDeleteSubOrganizer = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este sub-organizador?')) {
      await removeSubOrganizer(id);
    }
  };

  const handleEventCreated = () => {
    refetchEvents();
  };

  if (!organizerSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const isMainOrganizer = organizerSession.type === 'organizer';
  const canManageSubOrganizers = isMainOrganizer;

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
              <h1 className="text-3xl font-bold text-gray-900">
                Painel {isMainOrganizer ? 'do Organizador' : 'de Sub-Organizador'}
              </h1>
              <p className="text-gray-600">
                Logado como: {organizerSession.email} ({isMainOrganizer ? 'Organizador Principal' : 'Sub-Organizador'})
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            Sair
          </Button>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className={`grid w-fit ${canManageSubOrganizers ? 'grid-cols-3' : 'grid-cols-1'}`}>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            {canManageSubOrganizers && (
              <>
                <TabsTrigger value="sub-organizers">Sub-Organizadores</TabsTrigger>
                <TabsTrigger value="users">Usuários</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Gerenciar Eventos</h2>
              <Button 
                onClick={() => setIsEventModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </div>

            <div className="grid gap-4">
              {eventsLoading ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    Carregando eventos...
                  </CardContent>
                </Card>
              ) : events.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    Nenhum evento encontrado
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">
                            {event.type.includes('futebol') && event.type.includes('volei') ? '🏆' :
                             event.type.includes('futebol') ? '⚽' : '🏐'}
                          </span>
                          {event.type.split(',').map(sport => 
                            sport.charAt(0).toUpperCase() + sport.slice(1)
                          ).join(' + ')}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${event.status === 'Por acontecer' ? 'bg-blue-500' : 
                                                  event.status === 'Em andamento' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                            {event.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast({ title: "Em desenvolvimento", description: "Função será implementada em breve" })}
                          >
                            <Edit className="h-4 w-4" />
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
                            <strong>{event.confirmed?.length || 0} confirmados</strong>
                          </p>
                        </div>
                        {(event.confirmed?.length || 0) > 0 && (
                          <div className="mt-2">
                            <strong>Confirmados:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {event.confirmed?.map((user, index) => (
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
                ))
              )}
            </div>
          </TabsContent>

          {/* Sub-Organizers Tab - Only for main organizer */}
          {canManageSubOrganizers && (
            <>
              <TabsContent value="sub-organizers" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Sub-Organizadores</h2>
                  <Dialog open={isSubOrganizerModalOpen} onOpenChange={setIsSubOrganizerModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Sub-Organizador
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Adicionar Sub-Organizador</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddSubOrganizer} className="space-y-4">
                        <div>
                          <Label htmlFor="sub-org-email">Email</Label>
                          <Input
                            id="sub-org-email"
                            type="email"
                            value={subOrganizerForm.email}
                            onChange={(e) => setSubOrganizerForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@exemplo.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="sub-org-password">Senha</Label>
                          <Input
                            id="sub-org-password"
                            type="password"
                            value={subOrganizerForm.password}
                            onChange={(e) => setSubOrganizerForm(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Digite a senha (min. 6 caracteres)"
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            Adicionar
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsSubOrganizerModalOpen(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="grid gap-4">
                  {subOrganizersLoading ? (
                    <Card>
                      <CardContent className="py-8 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                        Carregando sub-organizadores...
                      </CardContent>
                    </Card>
                  ) : subOrganizers.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-gray-500">
                        Nenhum sub-organizador cadastrado ainda
                      </CardContent>
                    </Card>
                  ) : (
                    subOrganizers.map((subOrganizer) => (
                      <Card key={subOrganizer.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{subOrganizer.email}</p>
                              <p className="text-sm text-gray-500">
                                Criado em: {new Date(subOrganizer.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-orange-600">Sub-Organizador</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSubOrganizer(subOrganizer.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Users Tab - New tab for viewing all users */}
              <TabsContent value="users" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Usuários do Sistema</h2>
                </div>
                <UsersTable />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <CreateEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <Dialog open={isSubOrganizerModalOpen} onOpenChange={setIsSubOrganizerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Sub-Organizador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubOrganizer} className="space-y-4">
            <div>
              <Label htmlFor="sub-org-email">Email</Label>
              <Input
                id="sub-org-email"
                type="email"
                value={subOrganizerForm.email}
                onChange={(e) => setSubOrganizerForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="sub-org-password">Senha</Label>
              <Input
                id="sub-org-password"
                type="password"
                value={subOrganizerForm.password}
                onChange={(e) => setSubOrganizerForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Digite a senha (min. 6 caracteres)"
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Adicionar
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSubOrganizerModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organizer;
