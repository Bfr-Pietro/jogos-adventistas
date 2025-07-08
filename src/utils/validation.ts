
// Sanitization function
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Event data validation
export const validateEventData = (eventData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!eventData.type || eventData.type.trim() === '') {
    errors.push('Tipo de evento é obrigatório');
  }

  if (!eventData.address || eventData.address.trim() === '') {
    errors.push('Endereço é obrigatório');
  }

  if (!eventData.date) {
    errors.push('Data é obrigatória');
  } else {
    // Allow today's date - fix the date validation
    const selectedDate = new Date(eventData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push('A data do evento deve ser hoje ou no futuro');
    }
  }

  if (!eventData.time) {
    errors.push('Horário é obrigatório');
  }

  if (typeof eventData.lat !== 'number' || typeof eventData.lng !== 'number') {
    errors.push('Coordenadas de localização são obrigatórias');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password strength validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('A senha deve ter pelo menos 6 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Username validation
export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!username || username.trim() === '') {
    errors.push('Nome de usuário é obrigatório');
  }

  if (username.length < 2) {
    errors.push('Nome de usuário deve ter pelo menos 2 caracteres');
  }

  if (username.length > 50) {
    errors.push('Nome de usuário não pode ter mais de 50 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
