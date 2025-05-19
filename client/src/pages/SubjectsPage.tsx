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
  DialogContentText,
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
  Tooltip,
  InputLabel,
  FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { subjectService } from '../services/subjectService';
import { Subject } from '../types';

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    weeklyHours: 0,
    color: '#3788d8'
  });

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAll();
      setSubjects(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddClick = () => {
    setCurrentSubject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      weeklyHours: 0,
      color: '#3788d8'
    });
    setFormOpen(true);
  };

  const handleEditClick = (subject: Subject) => {
    setCurrentSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      description: subject.description || '',
      weeklyHours: subject.weeklyHours,
      color: subject.color || '#3788d8'
    });
    setFormOpen(true);
  };

  const handleDeleteClick = (subject: Subject) => {
    setCurrentSubject(subject);
    setDeleteDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weeklyHours' ? parseInt(value) || 0 : value
    }));
  };

  const handleColorChange = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      if (currentSubject) {
        await subjectService.update(currentSubject.id, formData);
      } else {
        await subjectService.create(formData);
      }
      setFormOpen(false);
      fetchSubjects();
    } catch (err) {
      console.error('Error saving subject:', err);
      setError('Failed to save subject. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (currentSubject) {
      try {
        setLoading(true);
        await subjectService.delete(currentSubject.id);
        setDeleteDialogOpen(false);
        fetchSubjects();
      } catch (err) {
        console.error('Error deleting subject:', err);
        setError('Failed to delete subject. Please try again.');
        setLoading(false);
        setDeleteDialogOpen(false);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Subjects</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Subject
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
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Weekly Hours</TableCell>
                <TableCell>Color</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No subjects found. Add a new subject to get started.
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.code || '-'}</TableCell>
                    <TableCell>{subject.description || '-'}</TableCell>
                    <TableCell>{subject.weeklyHours}</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          backgroundColor: subject.color || '#3788d8',
                          borderRadius: '4px'
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditClick(subject)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick(subject)}
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

      {/* Add/Edit Subject Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Subject Name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="code"
                label="Subject Code"
                value={formData.code}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="weeklyHours"
                label="Weekly Hours"
                type="number"
                value={formData.weeklyHours}
                onChange={handleFormChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="subject-color">Color</InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <input
                    id="subject-color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    style={{ width: '100%', height: '38px' }}
                  />
                </Box>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={3}
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
            disabled={!formData.name}
          >
            {currentSubject ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the subject "{currentSubject?.name}"? This action cannot be undone.
          </DialogContentText>
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

export default SubjectsPage;
