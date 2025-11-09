import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Divider,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useUser } from '../../context/UserContext';
import { getApiData } from '../../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const { login, logout, user } = useUser();
  const [selectedUserValue, setSelectedUserValue] = React.useState('');
  const [clients, setClients] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch clients on mount
  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await getApiData('/api/clients', {});
        setClients(data.data.clients || []);
      } catch (e) {
        console.error('Failed to load clients:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    if (!selectedUserValue) return;
    
    const selectedUser = JSON.parse(selectedUserValue);
    
    // invalid selection
    if (!selectedUser.type) return;

    // Set user in context (which also stores in localStorage)
    login(selectedUser);
    
    // Navigate to buildings page
    navigate('/buildings');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Welcome { user?.userDisplayName }
          </Typography>
          <Divider />
          { !user && (
            <FormControl fullWidth>
              <InputLabel>User</InputLabel>
              <Select
                value={selectedUserValue}
                onChange={(e) => setSelectedUserValue(e.target.value)}
                label="Select User Type"
                disabled={loading}
              >
                <MenuItem value={JSON.stringify({ type: 'admin', id: null, displayName: 'Admin' })}>
                  <ListItemText primary="Admin" />
                </MenuItem>
                <Divider />
                <MenuItem value={JSON.stringify({ type: 'external', id: null, displayName: 'External User' })}>
                  <ListItemText primary="External User" />
                </MenuItem>
                <Divider />
                <MenuItem value="client" disabled={true}>
                  <ListItemText primary="Client:" />
                </MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={JSON.stringify({type: 'client', ...client})} sx={{ pl: 4 }}>
                    <ListItemText primary={client.name} />
                  </MenuItem>
                ))}
              </Select>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </FormControl>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={user ? handleLogout : handleLogin}
            disabled={(!user && !selectedUserValue) || loading}
            sx={{ mt: 2 }}
          >
            {user ? 'Log Out' : 'Log In'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

