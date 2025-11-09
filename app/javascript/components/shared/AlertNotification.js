import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useAlert } from '../../context/AlertContext';

export default function AlertNotification() {
  const { error, success, clearError, clearSuccess } = useAlert();
  const [isSuccessHovered, setIsSuccessHovered] = React.useState(false);

  React.useEffect(() => {
    if (!success) {
      setIsSuccessHovered(false);
    }
  }, [success]);

  const handleErrorClose = React.useCallback((_, reason) => {
    if (reason === 'clickaway') return;
    clearError();
  }, [clearError]);

  const handleSuccessClose = React.useCallback((_, reason) => {
    if (reason === 'clickaway') return;
    clearSuccess();
  }, [clearSuccess]);

  const successAutoHideDuration = isSuccessHovered ? null : 5000;

  return (
    <>
      <Snackbar
        open={Boolean(error)}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ boxShadow: 4 }} onClose={handleErrorClose}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={successAutoHideDuration ?? undefined}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          sx={{ boxShadow: 4 }}
          onClose={handleSuccessClose}
          onMouseEnter={() => setIsSuccessHovered(true)}
          onMouseLeave={() => setIsSuccessHovered(false)}
        >
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}

