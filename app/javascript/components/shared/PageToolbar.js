import React from 'react';
import { Link } from 'react-router-dom';
import { Toolbar, Typography, Button } from '@mui/material';

export default function PageToolbar({ title, actionLabel, actionUrl, onActionClick, disabled = false }) {
  return (
    <Toolbar disableGutters sx={{ justifyContent: 'space-between', m: 0, p: 0 }}>
      <Typography variant="h4" component="h2">
        {title}
      </Typography>
      {actionLabel && (
        actionUrl ? (
          <Button variant="contained" color="primary" component={Link} to={actionUrl} disabled={disabled}>
            {actionLabel}
          </Button>
        ) : onActionClick ? (
          <Button variant="contained" color="primary" onClick={onActionClick} disabled={disabled}>
            {actionLabel}
          </Button>
        ) : null
      )}
    </Toolbar>
  );
}

