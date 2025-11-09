// Validation utility functions

export const validateZip = (zip) => {
  if (!zip) {
    return 'Zip code is required';
  }
  if (!/^\d{5}$/.test(zip)) {
    return 'Invalid zip code';
  }
  return '';
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return '';
};

export const validateNumber = (value, fieldName) => {
  if (value && value.trim() !== '') {
    if (isNaN(Number(value))) {
      return `${fieldName} must be a number`;
    }
  }
  return '';
};

export const validateEnum = (value, options, fieldName) => {
  if (value && value.trim() !== '') {
    const validOptions = options.map(opt => opt.trim());
    if (!validOptions.includes(value.trim())) {
      return `${fieldName} must be one of: ${validOptions.join(', ')}`;
    }
  }
  return '';
};

