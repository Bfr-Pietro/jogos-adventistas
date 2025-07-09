
// Enhanced validation with better security

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .slice(0, 500); // Limit length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 100;
};

export const validateUsername = (username: string) => {
  const errors: string[] = [];
  
  if (!username || username.length < 2) {
    errors.push('Nome de usuário deve ter pelo menos 2 caracteres');
  }
  
  if (username.length > 50) {
    errors.push('Nome de usuário deve ter no máximo 50 caracteres');
  }
  
  // Allow letters, numbers, underscore, space, and common accented characters
  const usernameRegex = /^[a-zA-ZÀ-ÿ0-9\s_]+$/;
  if (username && !usernameRegex.test(username)) {
    errors.push('Nome de usuário pode conter apenas letras, números, espaços e _');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePassword = (password: string) => {
  const errors: string[] = [];
  
  if (!password || password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  
  if (password.length > 128) {
    errors.push('Senha muito longa');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEventData = (eventData: any) => {
  const errors: string[] = [];
  
  if (!eventData.type || eventData.type.trim() === '') {
    errors.push('Tipo de evento é obrigatório');
  }
  
  if (!eventData.address || eventData.address.trim() === '') {
    errors.push('Endereço é obrigatório');
  } else if (eventData.address.length > 200) {
    errors.push('Endereço muito longo');
  }
  
  if (!eventData.date) {
    errors.push('Data é obrigatória');
  } else {
    // Enhanced date validation
    const selectedDate = new Date(eventData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (isNaN(selectedDate.getTime())) {
      errors.push('Data inválida');
    } else if (selectedDate < today) {
      errors.push('Data deve ser hoje ou no futuro');
    }
  }
  
  if (!eventData.time) {
    errors.push('Horário é obrigatório');
  }
  
  // Validate coordinates
  if (typeof eventData.lat !== 'number' || eventData.lat < -90 || eventData.lat > 90) {
    errors.push('Latitude inválida');
  }
  
  if (typeof eventData.lng !== 'number' || eventData.lng < -180 || eventData.lng > 180) {
    errors.push('Longitude inválida');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
