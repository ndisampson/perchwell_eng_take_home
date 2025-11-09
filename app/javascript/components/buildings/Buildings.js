import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import PageToolbar from '../shared/PageToolbar';
import { useAlert } from '../../context/AlertContext';
import { useUser } from '../../context/UserContext';
import { getApiData } from '../../utils/api';

export default function Buildings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useAlert();
  const { userId, isClient } = useUser();
  const [buildings, setBuildings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);

  const successMessage = location.state?.successMessage;
  const clientId = isClient ? userId : null;

  const fetchBuildings = React.useCallback(async (pageNum) => {
    try {
      setLoading(true);
      setError('');
      const data = await getApiData(`/api/buildings?page=${pageNum}&per_page=${perPage}`, {}, clientId);
      setBuildings(Array.isArray(data.buildings) ? data.buildings : []);
      if (data.pagination) {
        setTotalPages(data.pagination.total_pages || 1);
      }
    } catch (e) {
      setError(e.message || 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  }, [perPage, clientId]);

  React.useEffect(() => {
    fetchBuildings(page);
  }, [page, fetchBuildings]);

  React.useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
      navigate(location.pathname, { replace: true });
    }
  }, [successMessage, showSuccess, navigate, location.pathname]);

  return (
    <Box>
      <PageToolbar 
        title="Buildings" 
        actionLabel={isClient ? "New Building" : null} 
        actionUrl="/buildings/new"
      />
      
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress color="primary" />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!loading && !error && (
        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
            gap: 2,
          }}>
          {buildings.map((building) => (
              <Card key={building.id} variant="outlined">
                <CardActionArea onClick={() => navigate(`/buildings/${building.id}/edit`)}>
                  <Box
                    sx={{
                      height: 140,
                      backgroundImage: `url(/assets/home_icon.svg)`,
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'contain',
                      backgroundColor: '#f5f5f5',
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div" fontWeight="bold" gutterBottom>
                      {building.client.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {[building.address, building.city, building.state, building.zip].filter(Boolean).join(', ')}
                    </Typography>
                    <Chip label={`ID: ${building.id}`} size="small" sx={{ mt: 1, mb: 2 }} />
                    <Divider sx={{ my: 2 }} />
                    {/* custom fields */}
                    <Stack spacing={1}>
                      {Object.entries(building.custom_field_vals || {}).map(([key, value]) => {
                        const customFieldDefs = building?.client?.custom_field_defs || [];
                        const matchedField = customFieldDefs.find((cf) => cf.name === key);
                        const displayName = matchedField?.display_name || key;
                        return (
                          <Box key={`${building.id}-${key}`} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              {displayName}
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {String(value || '')}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
          ))}
        </Box>
      )}

      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
        <Button
          variant="contained"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>
        <Typography variant="body1">
          Page {page} / {totalPages}
        </Typography>
        <Button
          variant="contained"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}

