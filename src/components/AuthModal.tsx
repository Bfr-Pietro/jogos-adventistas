import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus, AlertCircle, Shield, Users } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useOrganizerAuth } from '@/hooks/useOrganizerAuth';
import { validateEmail, validateUsername, validatePassword, sanitizeInput } from '@/utils/validation';
import ForgotPasswordModal from './ForgotPasswordModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', username: '' });
  const [organizerForm, setOrganizerForm] = useState({ email: '', password: '' });
  const [subOrganizerForm, setSubOrganizerForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<string[]>([]);
  const [signupErrors, setSignupErrors] = useState<string[]>([]);
  const [organizerErrors, setOrganizerErrors] = useState<string[]>([]);
  const [subOrganizerErrors, setSubOrganizerErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { loginAsOrganizer, loginAsSubOrganizer } = useOrganizerAuth();

  const validateLoginForm = (): boolean => {
    const errors: string[] = [];
    
    if (!loginForm.email) {
      errors.push('Email é obrigatório');
    } else if (!validateEmail(loginForm.email)) {
      errors.push('Email inválido');
    }
    
    if (!loginForm.password) {
      errors.push('Senha é obrigatória');
    }
    
    setLoginErrors(errors);
    return errors.length === 0;
  };

  const validateSignupForm = (): boolean => {
    const errors: string[] = [];
    
    if (!signupForm.email) {
      errors.push('Email é obrigatório');
    } else if (!validateEmail(signupForm.email)) {
      errors.push('Email inválido');
    }
    
    if (!signupForm.username) {
      errors.push('Nome de usuário é obrigatório');
    } else {
      const usernameValidation = validateUsername(signupForm.username);
      if (!usernameValidation.isValid) {
        errors.push(...usernameValidation.errors);
      }
    }
    
    if (!signupForm.password) {
      errors.push('Senha é obrigatória');
    } else {
      const passwordValidation = validatePassword(signupForm.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }
    
    setSignupErrors(errors);
    return errors.length === 0;
  };

  const validateOrganizerForm = (): boolean => {
    const errors: string[] = [];
    
    if (!organizerForm.email) {
      errors.push('Email/usuário é obrigatório');
    }
    
    if (!organizerForm.password) {
      errors.push('Senha é obrigatória');
    }
    
    setOrganizerErrors(errors);
    return errors.length === 0;
  };

  const validateSubOrganizerForm = (): boolean => {
    const errors: string[] = [];
    
    if (!subOrganizerForm.email) {
      errors.push('Email é obrigatório');
    } else if (!validateEmail(subOrganizerForm.email)) {
      errors.push('Email inválido');
    }
    
    if (!subOrganizerForm.password) {
      errors.push('Senha é obrigatória');
    }
    
    setSubOrganizerErrors(errors);
    return errors.length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors([]);
    
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    setIsLoading(false);
    
    if (!error) {
      onClose();
      setLoginForm({ email: '', password: '' });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors([]);
    
    if (!validateSignupForm()) return;
    
    setIsLoading(true);
    const { error } = await signUp(
      signupForm.email, 
      signupForm.password, 
      sanitizeInput(signupForm.username)
    );
    setIsLoading(false);
    
    if (!error) {
      onClose();
      setSignupForm({ email: '', password: '', username: '' });
    }
  };

  const handleOrganizerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrganizerErrors([]);
    
    if (!validateOrganizerForm()) return;
    
    setIsLoading(true);
    const result = await loginAsOrganizer(organizerForm.email, organizerForm.password);
    setIsLoading(false);
    
    if (result.success) {
      onClose();
      setOrganizerForm({ email: '', password: '' });
      window.location.href = '/organizer';
    }
  };

  const handleSubOrganizerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubOrganizerErrors([]);
    
    if (!validateSubOrganizerForm()) return;
    
    setIsLoading(true);
    const result = await loginAsSubOrganizer(subOrganizerForm.email, subOrganizerForm.password);
    setIsLoading(false);
    
    if (result.success) {
      onClose();
      setSubOrganizerForm({ email: '', password: '' });
      window.location.href = '/organizer';
    }
  };

  const ErrorDisplay = ({ errors }: { errors: string[] }) => {
    if (errors.length === 0) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Erro de validação:</span>
        </div>
        <ul className="mt-2 text-sm text-red-600">
          {errors.map((error, index) => (
            <li key={index} className="ml-2">• {error}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Acesse sua conta</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="login" className="flex items-center gap-1 text-xs">
                <User className="h-3 w-3" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-1 text-xs">
                <UserPlus className="h-3 w-3" />
                Cadastrar
              </TabsTrigger>
              <TabsTrigger value="organizer" className="flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3" />
                Organizador
              </TabsTrigger>
              <TabsTrigger value="sub-organizer" className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                Sub-Org
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Entrar
                  </CardTitle>
                  <CardDescription>
                    Entre com sua conta existente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorDisplay errors={loginErrors} />
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu@email.com"
                        className="mt-1"
                        required
                        maxLength={254}
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Digite sua senha"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div className="text-right">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setIsForgotPasswordOpen(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto"
                      >
                        Esqueci minha senha
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Criar Conta
                  </CardTitle>
                  <CardDescription>
                    Crie sua conta para participar dos jogos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorDisplay errors={signupErrors} />
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-username">Nome de usuário</Label>
                      <Input
                        id="signup-username"
                        type="text"
                        value={signupForm.username}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Digite seu nome de usuário"
                        className="mt-1"
                        required
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 2 caracteres
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu@email.com"
                        className="mt-1"
                        required
                        maxLength={254}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Digite sua senha"
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 6 caracteres
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {isLoading ? 'Criando...' : 'Criar Conta'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organizer">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Organizador Principal
                  </CardTitle>
                  <CardDescription>
                    Acesse o painel administrativo principal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorDisplay errors={organizerErrors} />
                  <form onSubmit={handleOrganizerLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="org-email">Usuário</Label>
                      <Input
                        id="org-email"
                        type="text"
                        value={organizerForm.email}
                        onChange={(e) => setOrganizerForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="bfrpietro"
                        className="mt-1"
                        required
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
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    >
                      {isLoading ? 'Entrando...' : 'Entrar como Organizador'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sub-organizer">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    Sub-Organizador
                  </CardTitle>
                  <CardDescription>
                    Acesse como sub-organizador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorDisplay errors={subOrganizerErrors} />
                  <form onSubmit={handleSubOrganizerLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="sub-org-email">Email</Label>
                      <Input
                        id="sub-org-email"
                        type="email"
                        value={subOrganizerForm.email}
                        onChange={(e) => setSubOrganizerForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                        className="mt-1"
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
                        placeholder="Digite sua senha"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      {isLoading ? 'Entrando...' : 'Entrar como Sub-Organizador'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </>
  );
};

export default AuthModal;
