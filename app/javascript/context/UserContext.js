import React from 'react';

export const UserContext = React.createContext();

export function UserProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    // Initialize from localStorage if available
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = React.useCallback((userInfo) => {
    userInfo.timestamp = Date.now();
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.type === 'admin',
        isClient: user?.type === 'client',
        isExternalUser: user?.type === 'external',
        userId: user?.id,
       }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

