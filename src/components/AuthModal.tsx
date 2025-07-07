
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validateUsername, validatePassword, sanitizeInput } from '@/utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', username: '' });
  const [loginErrors, setLoginErrors] = useState<string[]>([]);
  const [signupErrors, setSignupErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

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
    } else if (!validateUsername(signupForm.username)) {
      errors.push('Nome de usuário deve ter 3-50 caracteres (apenas letras, números e _)');
    }
    
    if (!signupForm.password) {
      errors.push('Senha é obrigatória');
    } else {
      const passwordValidation = validatePassword(signupForm.password);
      if (!passwordValidation.isValid) {
        errors.push(passwordValidation.message);
      }
    }
    
    setSignupErrors(errors);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Acesse sua conta</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Entrar
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastrar
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
                      3-50 caracteres, apenas letras, números e _
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
                      Mínimo 8 caracteres, incluindo letras e números
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
