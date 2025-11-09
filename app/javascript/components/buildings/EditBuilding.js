import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  CircularProgress,
  Stack,
  Paper,
  Grid,
} from '@mui/material';
import { states } from '../../constants.js';
import { useAlert } from '../../context/AlertContext';
import { useUser } from '../../context/UserContext';
import { apiRequest, getApiData } from '../../utils/api';
import { validateZip, validateRequired, validateNumber, validateEnum } from '../../utils/validation.js';

export default function EditBuilding() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError, clearAll } = useAlert();
  const { userId, isExternalUser, isClient } = useUser();
  const isEdit = !!id;
  const editMode = isEdit ? 'edit' : 'new';
  const displayMode = isExternalUser ? 'view' : editMode;
  
  const [client, setClient] = React.useState(null);
  const [clientId, setClientId] = React.useState(isClient ? userId : null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    client_id: '',
    custom_field_values: {}
  });
  
  const [touched, setTouched] = React.useState({});
  const [errors, setErrors] = React.useState({});
  const [customFieldErrors, setCustomFieldErrors] = React.useState({});
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        let buildingClientId = clientId;
        let buildingData = null;

        if (isEdit) {
          const buildingJson = await getApiData(`/api/buildings/${id}`, {}, userId);
          buildingData = buildingJson.data.building;

          if (!buildingData || !buildingData.client) {
            throw new Error('Building client information is missing.');
          }

          buildingClientId = buildingData.client.id?.toString() || null;
          if (buildingClientId && buildingClientId !== clientId) {
            setClientId(buildingClientId);
          }

          setFormData({
            address: buildingData.address || '',
            city: buildingData.city || '',
            state: buildingData.state || '',
            zip: buildingData.zip || '',
            client_id: buildingClientId || '',
            custom_field_values: buildingData.custom_field_vals || {}
          });
        }

        if (buildingClientId) {
          const clientJson = await getApiData(`/api/clients/${buildingClientId}`, {}, userId);
          setClient(clientJson.data.client);
        }
      } catch (e) {
        showError('Failed to load building: ' + (e.message || e.toString()));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEdit, id, userId, showError, clientId]);
  
  // Validation functions
  const validateField = (field, value) => {
    switch (field) {
      case 'zip':
        return validateZip(value);
      case 'address':
      case 'city':
      case 'state':
        return validateRequired(value, field.charAt(0).toUpperCase() + field.slice(1));
      case 'client_id':
        return validateRequired(value, 'Client');
      default:
        return '';
    }
  };

  const validateCustomField = (fieldName, value, customField) => {
    if (!customField) return '';
    
    switch (customField.data_type) {
      case 'number':
        return validateNumber(value, customField.display_name);
      case 'enum':
        const options = customField.enum_values?.split(',').map(s => s.trim()) || [];
        return validateEnum(value, options, customField.display_name);
      case 'freeform':
        // Freeform fields don't need validation beyond what's already handled
        return '';
      default:
        return '';
    }
  };

  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If field has been touched, validate on change
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  const handleCustomFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      custom_field_values: {
        ...prev.custom_field_values,
        [fieldName]: value
      }
    }));
    
    // If custom field has been touched, validate on change
    if (touched[`custom_${fieldName}`] && client) {
      const customField = client.custom_fields.find(cf => cf.name === fieldName);
      const error = validateCustomField(fieldName, value, customField);
      setCustomFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleCustomFieldBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [`custom_${fieldName}`]: true }));
    if (client) {
      const customField = client.custom_fields.find(cf => cf.name === fieldName);
      const value = formData.custom_field_values[fieldName] || '';
      const error = validateCustomField(fieldName, value, customField);
      setCustomFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    const newCustomFieldErrors = {};
    const fieldsToValidate = ['address', 'city', 'state', 'zip'];
    
    // Validate standard fields
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    // Validate custom fields
    if (client) {
      client.custom_fields.forEach(cf => {
        const value = formData.custom_field_values[cf.name] || '';
        const error = validateCustomField(cf.name, value, cf);
        if (error) {
          newCustomFieldErrors[cf.name] = error;
        }
      });
    }
    
    setErrors(newErrors);
    setCustomFieldErrors(newCustomFieldErrors);
    
    // Mark all fields as touched
    const allTouched = {};
    fieldsToValidate.forEach(field => {
      allTouched[field] = true;
    });
    if (client) {
      client.custom_fields.forEach(cf => {
        allTouched[`custom_${cf.name}`] = true;
      });
    }
    setTouched(allTouched);
    console.log('validateForm > newErrors', newErrors);
    console.log('validateForm > newCustomFieldErrors', newCustomFieldErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newCustomFieldErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }
    
    setSaving(true);
    clearAll();
    
    try {
      const url = isEdit ? `/api/buildings/${id}` : '/api/buildings';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await apiRequest(url, {
        method: method,
        body: JSON.stringify({
          building: {
            ...formData,
            client_id: parseInt(formData.client_id)
          }
        })
      }, userId);
      
      const respJson = await response.json();
      
      if (!response.ok) {
        const errors = respJson.errors || [respJson.status] || ['Failed to save building'];
        throw new Error(Array.isArray(errors) ? errors.join(', ') : errors);
      }

      navigate('/buildings', {
        state: {
          successMessage: `Building ${respJson.data?.building?.id} ${isEdit ? 'updated' : 'created'} successfully!`,
        },
      });
    } catch (e) {
      showError(e.message || 'Failed to save building');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        { displayMode === 'view' ? '' : displayMode.toLocaleUpperCase() + ' ' }
        { `Building ${id}` }
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField label="client" disabled value={client?.name} />
            
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onBlur={() => handleBlur('address')}
              error={!!errors.address}
              helperText={errors.address}
              required
              fullWidth
              disabled={isExternalUser}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 7 }}>
                <TextField
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  error={!!errors.city}
                  helperText={errors.city}
                  required
                  fullWidth
                  disabled={isExternalUser}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth required error={!!errors.state}>
                  <InputLabel error={!!errors.state}>State</InputLabel>
                  <Select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    onBlur={() => handleBlur('state')}
                    label="State"
                    disabled={isExternalUser}
                    error={!!errors.state}
                  >
                    {states.map((state) => (
                      <MenuItem key={state.value} value={state.value}>
                        {state.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.state && (
                    <FormHelperText error>{errors.state}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Zip"
                  value={formData.zip}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                  onBlur={() => handleBlur('zip')}
                  error={!!errors.zip}
                  helperText={errors.zip}
                  required
                  fullWidth
                  disabled={isExternalUser}
                />
              </Grid>
            </Grid>
            
            {client && client.custom_fields.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Custom Fields
                </Typography>
                <Stack spacing={2}>
                  {client.custom_fields.map((cf) => {
                    if (cf.data_type === 'enum') {
                      const options = cf.enum_values?.split(',').map(s => s.trim()) || [];
                      const error = customFieldErrors[cf.name];
                      return (
                        <FormControl key={cf.name} fullWidth error={!!error}>
                          <InputLabel>{cf.display_name}</InputLabel>
                          <Select
                            value={formData.custom_field_values[cf.name] || ''}
                            onChange={(e) => handleCustomFieldChange(cf.name, e.target.value)}
                            onBlur={() => handleCustomFieldBlur(cf.name)}
                            label={cf.display_name}
                            disabled={isExternalUser}
                          >
                            <MenuItem value="">None</MenuItem>
                            {options.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                          {error && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                              {error}
                            </Typography>
                          )}
                        </FormControl>
                      );
                    } else {
                      return (
                        <TextField
                          key={cf.name}
                          label={cf.display_name}
                          value={formData.custom_field_values[cf.name] || ''}
                          onChange={(e) => handleCustomFieldChange(cf.name, e.target.value)}
                          onBlur={() => handleCustomFieldBlur(cf.name)}
                          error={!!customFieldErrors[cf.name]}
                          helperText={customFieldErrors[cf.name]}
                          fullWidth
                          disabled={isExternalUser}
                        />
                      );
                    }
                  })}
                </Stack>
              </Box>
            )}
            
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              {!isExternalUser && (
                <>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={saving}
                    >
                    {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/buildings')}
                    disabled={saving}
                    >
                    Cancel
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

