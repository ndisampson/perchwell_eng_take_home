import React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
// Using text labels instead of icons for now
import PageToolbar from '../shared/PageToolbar';
import { useAlert } from '../../context/AlertContext';
import { useUser } from '../../context/UserContext';
import { apiRequest, getApiData } from '../../utils/api';
import EditCustomFields from './EditCustomFields';

export default function CustomFields() {
  const { showError, showSuccess } = useAlert();
  const { userId, isExternalUser, isAdmin, isClient } = useUser();
  
  const [clients, setClients] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const handleError = React.useCallback((message) => {
    setError(message);
    showError(message);
  }, [showError]);

  const fetchCustomFields = React.useCallback(async (clientIdValue) => {
    if (!clientIdValue) {
      setCustomFields([]);
      return;
    }

    try {
      const data = await getApiData(`/api/clients/${clientIdValue}/custom_fields`, {}, userId);
      const fields = data?.data?.custom_fields || [];
      setCustomFields(fields);
      setSelectedClient((prev) => {
        if (!prev || prev.id?.toString() !== clientIdValue.toString()) {
          return prev;
        }
        return { ...prev, custom_fields: fields };
      });
    } catch (e) {
      handleError('Failed to load custom fields: ' + e.message);
    }
  }, [userId, handleError]);

  const fetchClients = React.useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const data = await getApiData(`/api/clients`, {}, userId);
        const clientList = data?.data?.clients || [];
        setClients(clientList);
        const defaultClient = clientList[0] || null;
        setSelectedClient(defaultClient);
        setCustomFields(defaultClient?.custom_fields || []);
        if (defaultClient?.id) {
          fetchCustomFields(defaultClient.id);
        }
      } else if (isClient) {
        const data = await getApiData(`/api/clients/${userId}`, {}, userId);
        const client = data?.data?.client || null;
        setClients(client ? [client] : []);
        setSelectedClient(client);
        setCustomFields(client?.custom_fields || []);
        if (client?.id) {
          fetchCustomFields(client.id);
        }
      } else {
        setClients([]);
        setSelectedClient(null);
        setCustomFields([]);
      }
    } catch (e) {
      handleError('Failed to load clients: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isClient, userId, handleError, fetchCustomFields]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleClientChange = (event) => {
    const clientId = event.target.value;
    const client = clients.find(c => c.id.toString() === clientId);
    setSelectedClient(client);
    setCustomFields(client?.custom_fields || []);
    if (client?.id) {
      fetchCustomFields(client.id);
    }
  };

  const handleOpenDialog = (field = null) => {
    setEditingField(field);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingField(null);
  };

  const handleDelete = async (field) => {
    if (!window.confirm(`Are you sure you want to delete "${field.display_name}"?`)) {
      return;
    }

    try {
      const response = await apiRequest(`/api/custom_fields/${field.id}`, {
        method: 'DELETE'
      }, userId);
      
      const data = await response.json();
      
      if (!response.ok) {
        const errors = data.errors || [data.status] || ['Failed to delete custom field'];
        throw new Error(Array.isArray(errors) ? errors.join(', ') : errors);
      }
      
      showSuccess('Custom field deleted successfully!');
      if (selectedClient?.id) {
        fetchCustomFields(selectedClient.id);
      } else {
        fetchClients();
      }
    } catch (e) {
      handleError(e.message || 'Failed to delete custom field');
    }
  };

  const handleDialogSuccess = React.useCallback(() => {
    if (selectedClient?.id) {
      fetchCustomFields(selectedClient.id);
    } else {
      fetchClients();
    }
  }, [selectedClient, fetchCustomFields, fetchClients]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageToolbar 
        title="Custom Fields" 
        actionLabel={isExternalUser ? null : "New Custom Field"} 
        actionUrl={null}
        onActionClick={() => {
          if (!selectedClient) {
            showError('Please select a client first');
            return;
          }
          handleOpenDialog();
        }}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Client</InputLabel>
            <Select
              value={selectedClient?.id.toString() || ''}
              onChange={handleClientChange}
              label="Select Client"
              disabled={isClient}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedClient && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Custom Fields for {selectedClient.name}
              </Typography>
              
              {customFields.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No custom fields defined for this client.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Display Name</TableCell>
                        <TableCell>Data Type</TableCell>
                        <TableCell>Enum Values</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customFields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell>{field.name}</TableCell>
                          <TableCell>{field.display_name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={field.data_type} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {field.data_type === 'enum' 
                              ? (field.enum_values || '-') 
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {!isExternalUser && (
                              <>
                                <Button
                                  size="small"
                                  onClick={() => handleOpenDialog(field)}
                                  color="primary"
                                  sx={{ mr: 1 }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  onClick={() => handleDelete(field)}
                                  color="error"
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Stack>
      </Paper>

      <EditCustomFields
        open={openDialog}
        onClose={handleCloseDialog}
        editingField={editingField}
        selectedClient={selectedClient}
        onSuccess={handleDialogSuccess}
      />
    </Box>
  );
}

