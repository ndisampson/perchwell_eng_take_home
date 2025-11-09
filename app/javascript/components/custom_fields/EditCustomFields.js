import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from '@mui/material';
import { useAlert } from '../../context/AlertContext';
import { useUser } from '../../context/UserContext';
import { apiRequest } from '../../utils/api';

export default function EditCustomFields({ open, onClose, editingField, selectedClient, onSuccess }) {
  const { showError, showSuccess } = useAlert();
  const { clientId: userClientId, isExternalUser } = useUser();
  
  const [formData, setFormData] = React.useState({
    name: '',
    display_name: '',
    data_type: 'freeform',
    enum_values: '',
    client_id: ''
  });
  
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  // Initialize form data when dialog opens or editingField changes
  React.useEffect(() => {
    if (open) {
      if (editingField) {
        // Normalize data_type to ensure it matches Select MenuItem values
        let normalizedDataType = editingField.data_type;
        if (editingField.data_type === 'enum_type' || editingField.data_type === 'enum') {
          normalizedDataType = 'enum';
        }
        setFormData({
          name: editingField.name,
          display_name: editingField.display_name,
          data_type: normalizedDataType,
          enum_values: editingField.enum_values || '',
          client_id: editingField.client_id
        });
      } else {
        setFormData({
          name: '',
          display_name: '',
          data_type: 'freeform',
          enum_values: '',
          client_id: selectedClient?.id.toString() || ''
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [open, editingField, selectedClient]);

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
      case 'display_name':
        if (!value || value.trim() === '') {
          return `${field === 'name' ? 'Name' : 'Display Name'} is required`;
        }
        return '';
      case 'enum_values':
        if (formData.data_type === 'enum' && (!value || value.trim() === '')) {
          return 'Enum values are required for enum type';
        }
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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

  const validateForm = () => {
    const newErrors = {};
    ['name', 'display_name'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    if (formData.data_type === 'enum') {
      const error = validateField('enum_values', formData.enum_values);
      if (error) newErrors.enum_values = error;
    }
    
    setErrors(newErrors);
    setTouched({
      name: true,
      display_name: true,
      enum_values: formData.data_type === 'enum'
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setSaving(true);
    
    try {
      const url = editingField 
        ? `/api/custom_fields/${editingField.id}`
        : `/api/clients/${formData.client_id}/custom_fields`;
      const method = editingField ? 'PUT' : 'POST';
      
      const response = await apiRequest(url, {
        method: method,
        body: JSON.stringify({
          custom_field: {
            name: formData.name,
            display_name: formData.display_name,
            data_type: formData.data_type,
            enum_values: formData.data_type === 'enum' ? formData.enum_values : null
          }
        })
      }, userClientId);
      
      const data = await response.json();
      
      if (!response.ok) {
        const errors = data.errors || [data.status] || ['Failed to save custom field'];
        throw new Error(Array.isArray(errors) ? errors.join(', ') : errors);
      }
      
      showSuccess(`Custom field ${editingField ? 'updated' : 'created'} successfully!`);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      showError(e.message || 'Failed to save custom field');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      display_name: '',
      data_type: 'freeform',
      enum_values: '',
      client_id: ''
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingField ? 'Edit Custom Field' : 'New Custom Field'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={!!errors.name}
            helperText={editingField ? 'Name cannot be changed after creation' : errors.name}
            required
            fullWidth
            disabled={!!editingField || isExternalUser}
          />
          
          <TextField
            label="Display Name"
            value={formData.display_name}
            onChange={(e) => handleInputChange('display_name', e.target.value)}
            onBlur={() => handleBlur('display_name')}
            error={!!errors.display_name}
            helperText={errors.display_name}
            required
            fullWidth
            disabled={isExternalUser}
          />
          
          <FormControl fullWidth>
            <InputLabel>Data Type</InputLabel>
            <Select
              value={formData.data_type || 'freeform'}
              onChange={(e) => handleInputChange('data_type', e.target.value)}
              label="Data Type"
              disabled={isExternalUser}
            >
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="freeform">Freeform</MenuItem>
              <MenuItem value="enum">Enum</MenuItem>
            </Select>
          </FormControl>
          
          {formData.data_type === 'enum' && (
            <TextField
              label="Enum Values (comma-separated)"
              value={formData.enum_values}
              onChange={(e) => handleInputChange('enum_values', e.target.value)}
              onBlur={() => handleBlur('enum_values')}
              error={!!errors.enum_values}
              helperText={errors.enum_values || 'Enter values separated by commas (e.g., Brick, Concrete, None)'}
              required
              fullWidth
              multiline
              rows={3}
              disabled={isExternalUser}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={saving || isExternalUser}
        >
          {saving ? 'Saving...' : (editingField ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

