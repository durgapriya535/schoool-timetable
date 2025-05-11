import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { periodService } from '../services/periodService';
import { Period } from '../types';

const PeriodsPage: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: ''
  });

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const data = await periodService.getAll();
      setPeriods(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching periods:', err);
      setError('Failed to load periods. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleAddClick = () => {
    setCurrentPeriod(null);
    setFormData({
      name: '',
      startTime: '',
      endTime: ''
    });
    setFormOpen(true);
  };

  const handleEditClick = (period: Period) => {
    setCurrentPeriod(period);
    setFormData({
      name: period.name,
      startTime: period.startTime,
      endTime: period.endTime
    });
    setFormOpen(true);
  };

  const handleDeleteClick = (period: Period) => {
    setCurrentPeriod(period);
    setDeleteDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      if (currentPeriod) {
        await periodService.update(currentPeriod.id, formData);
      } else {
        await periodService.create(formData);
      }
      setFormOpen(false);
      fetchPeriods();
    } catch (err) {
      console.error('Error saving period:', err);
      setError('Failed to save period. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (currentPeriod) {
      try {
        setLoading(true);
        await periodService.delete(currentPeriod.id);
        setDeleteDialogOpen(false);
        fetchPeriods();
      } catch (err) {
        console.error('Error deleting period:', err);
        setError('Failed to delete period. Please try again.');
        setLoading(false);
        setDeleteDialogOpen(false);
      }
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return timeString;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Periods</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Period
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && !formOpen && !deleteDialogOpen ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No periods found. Add a new period to get started.
                  </TableCell>
                </TableRow>
              ) : (
                periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell>{period.name}</TableCell>
                    <TableCell>{formatTime(period.startTime)}</TableCell>
                    <TableCell>{formatTime(period.endTime)}</TableCell>
                    <TableCell>
                      {period.startTime && period.endTime ? 
                        `${period.startTime} - ${period.endTime}` : 
                        '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditClick(period)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick(period)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Period Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentPeriod ? 'Edit Period' : 'Add Period'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Period Name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="startTime"
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={handleFormChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="endTime"
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={handleFormChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.name || !formData.startTime || !formData.endTime}
          >
            {currentPeriod ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the period "{currentPeriod?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeriodsPage;
