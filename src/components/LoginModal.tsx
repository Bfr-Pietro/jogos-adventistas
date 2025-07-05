import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Shield } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserLogin: (username: string) => void;
}

const LoginModal = ({ isOpen, onClose, onUserLogin }: LoginModalProps) => {
  const [userForm, setUserForm] = useState({ username: '', password: '' });
  const [organizerForm, setOrganizerForm] = useState({ username: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.username || !userForm.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    // Simulate user registration/login
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (isRegistering) {
      // Check if user already exists
      if (users.find((u: any) => u.username === userForm.username)) {
        toast({
          title: "Erro",
          description: "Usuário já existe",
          variant: "destructive"
        });
        return;
      }
      
      // Register new user
      users.push(userForm);
      localStorage.setItem('users', JSON.stringify(users));
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!"
      });
    } else {
      // Login existing user
      const user = users.find((u: any) => u.username === userForm.username && u.password === userForm.password);
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário ou senha incorretos",
          variant: "destructive"
        });
        return;
      }
    }

    localStorage.setItem('currentUser', userForm.username);
    localStorage.setItem('userType', 'client');
    onUserLogin(userForm.username);
    toast({
      title: "Sucesso",
      description: `Bem-vindo, ${userForm.username}!`
    });
    onClose();
    setUserForm({ username: '', password: '' });
  };

  const handleOrganizerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (organizerForm.username === 'bfrpietro' && organizerForm.password === '190615') {
      localStorage.setItem('currentUser', organizerForm.username);
      localStorage.setItem('userType', 'organizer');
      onUserLogin(organizerForm.username);
      toast({
        title: "Sucesso",
        description: "Login de organizador realizado com sucesso!"
      });
      onClose();
      setOrganizerForm({ username: '', password: '' });
      // Redirect to organizer panel
      window.location.href = '/organizer';
    } else {
      toast({
        title: "Erro",
        description: "Credenciais de organizador incorretas",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Acesse sua conta</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="client" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </TabsTrigger>
            <TabsTrigger value="organizer" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Organizador
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="client">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Login de Cliente
                </CardTitle>
                <CardDescription>
                  Entre com sua conta ou crie uma nova
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="client-username">Usuário</Label>
                    <Input
                      id="client-username"
                      type="text"
                      value={userForm.username}
                      onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Digite seu usuário"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-password">Senha</Label>
                    <Input
                      id="client-password"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Digite sua senha"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isRegistering}
                        onChange={(e) => setIsRegistering(e.target.checked)}
                        className="rounded"
                      />
                      <span>Criar nova conta</span>
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    {isRegistering ? 'Criar Conta' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="organizer">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Login de Organizador
                </CardTitle>
                <CardDescription>
                  Acesse o painel administrativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOrganizerLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="org-username">Usuário</Label>
                    <Input
                      id="org-username"
                      type="text"
                      value={organizerForm.username}
                      onChange={(e) => setOrganizerForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="bfrpietro"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="org-password">Senha</Label>
                    <Input
                      id="org-password"
                      type="password"
                      value={organizerForm.password}
                      onChange={(e) => setOrganizerForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="190615"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    Entrar como Organizador
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
