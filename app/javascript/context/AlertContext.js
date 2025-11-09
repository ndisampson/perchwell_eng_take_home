import React from 'react';

export const AlertContext = React.createContext();

export function AlertProvider({ children }) {
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const showError = React.useCallback((message) => {
    setError(message);
    setSuccess('');
  }, []);

  const showSuccess = React.useCallback((message) => {
    setSuccess(message);
    setError('');
  }, []);

  const clearError = React.useCallback(() => {
    setError('');
  }, []);

  const clearSuccess = React.useCallback(() => {
    setSuccess('');
  }, []);

  const clearAll = React.useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return (
    <AlertContext.Provider
      value={{
        error,
        success,
        showError,
        showSuccess,
        clearError,
        clearSuccess,
        clearAll,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

