// Entry point for the build script in your package.json
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Container, Box, Button } from '@mui/material';
import theme from './theme';
import { AlertProvider } from './context/AlertContext';
import { UserProvider, useUser } from './context/UserContext';
import AlertNotification from './components/shared/AlertNotification';
import HomePage from './components/HomePage';
import Buildings from './components/buildings/Buildings';
import EditBuilding from './components/buildings/EditBuilding';
import CustomFields from './components/custom_fields/CustomFields';

function ProtectedRoute({ children }) {
  const { user } = useUser();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function NavigationBar() {
  const { isExternalUser, user, logout } = useUser();
  
  const handleLogout = () => {
    logout();
  };
  return (
    <AppBar position="static" sx={{ backgroundColor: '#333', m: 0 }}>
      <Toolbar>
        <Box component="img" 
          src="https://cdn.prod.website-files.com/67f688c51cfd3832cdf1ef92/67f688c51cfd3832cdf1f02d___perchwell_logo_type_electric_mint.png" 
          alt="Perchwell Logo" 
          sx={{ height: 50, mr: 2 }} 
        />
        { user && (
          <>
            <Button color="inherit" component={Link} to="/" sx={{ mr: 2 }}>
              Home
            </Button>
            <Button color="inherit" component={Link} to="/buildings" sx={{ mr: 2 }}>
              Buildings
            </Button>
            {!isExternalUser && (
              <Button color="inherit" component={Link} to="/custom-fields" sx={{ mr: 2 }}>
                Custom Fields
              </Button>
            )}
            <Button color="inherit" component={Link} to="/" onClick={handleLogout}>
              Log Out {`(${user.name || user.type})`}
            </Button>
            </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function AppRouter() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <AlertProvider>
          <BrowserRouter>
          <Box sx={{ flexGrow: 1, mb: 0, pb: 4 }}>
            <NavigationBar />
            <AlertNotification />
            <Container sx={{ mt: 2 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route 
                  path="/buildings" 
                  element={
                    <ProtectedRoute>
                      <Buildings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/buildings/new" 
                  element={
                    <ProtectedRoute>
                      <EditBuilding />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/buildings/:id/edit" 
                  element={
                    <ProtectedRoute>
                      <EditBuilding />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/custom-fields" 
                  element={
                    <ProtectedRoute>
                      <CustomFields />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Container>
          </Box>
          </BrowserRouter>
        </AlertProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('react-root');
  if (node) {
    const root = createRoot(node);
    root.render(<AppRouter />);
  }
});
