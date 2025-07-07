
// Utility functions for input validation and sanitization
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  // Username must be 3-50 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos um número' };
  }
  
  return { isValid: true, message: '' };
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters and trim whitespace
  return input.trim().replace(/[<>]/g, '');
};

export const validateEventData = (data: {
  type: string;
  address: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate type
  const validTypes = ['futebol', 'volei', 'futebol,volei', 'volei,futebol'];
  if (!validTypes.includes(data.type)) {
    errors.push('Tipo de evento inválido');
  }
  
  // Validate address
  if (!data.address || data.address.trim().length === 0) {
    errors.push('Endereço é obrigatório');
  } else if (data.address.length > 200) {
    errors.push('Endereço muito longo');
  }
  
  // Validate coordinates
  if (data.lat < -90 || data.lat > 90) {
    errors.push('Latitude inválida');
  }
  
  if (data.lng < -180 || data.lng > 180) {
    errors.push('Longitude inválida');
  }
  
  // Validate date (must be today or future)
  const eventDate = new Date(data.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (eventDate < today) {
    errors.push('A data do evento deve ser hoje ou no futuro');
  }
  
  return { isValid: errors.length === 0, errors };
};
