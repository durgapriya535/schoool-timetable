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
  Tooltip,
  TableSortLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { teacherService } from '../services/teacherService';
import { Teacher } from '../types';

// Type for sort order
type Order = 'asc' | 'desc';

// Type for sort field
type SortField = 'name' | 'specialization' | 'maxWeeklyHours';

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialization: '',
    maxWeeklyHours: 0
  });
  
  // Sorting states
  const [orderBy, setOrderBy] = useState<SortField>('name');
  const [order, setOrder] = useState<Order>('asc');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle sorting
  const handleRequestSort = (property: SortField) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Function to sort teachers based on current sort settings
  const sortedTeachers = React.useMemo(() => {
    const comparator = (a: Teacher, b: Teacher) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];
      
      // Handle null or undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      // For string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // For number comparison
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    };
    
    return [...teachers].sort(comparator);
  }, [teachers, order, orderBy]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddClick = () => {
    setCurrentTeacher(null);
    setFormData({
      name: '',
      phone: '',
      specialization: '',
      maxWeeklyHours: 0
    });
    setFormOpen(true);
  };

  const handleEditClick = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setFormData({
      name: teacher.name,
      phone: teacher.phone || '',
      specialization: teacher.specialization || '',
      maxWeeklyHours: teacher.maxWeeklyHours
    });
    setFormOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxWeeklyHours' ? parseInt(value) || 0 : value
    }));
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      if (currentTeacher) {
        await teacherService.update(currentTeacher.id, formData);
      } else {
        await teacherService.create(formData);
      }
      setFormOpen(false);
      fetchTeachers();
    } catch (err) {
      console.error('Error saving teacher:', err);
      setError('Failed to save teacher. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (currentTeacher) {
      try {
        setLoading(true);
        await teacherService.delete(currentTeacher.id);
        setDeleteDialogOpen(false);
        fetchTeachers();
      } catch (err) {
        console.error('Error deleting teacher:', err);
        setError('Failed to delete teacher. Please try again.');
        setLoading(false);
        setDeleteDialogOpen(false);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Teachers</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Teacher
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
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'specialization'}
                    direction={orderBy === 'specialization' ? order : 'asc'}
                    onClick={() => handleRequestSort('specialization')}
                  >
                    Specialization
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'maxWeeklyHours'}
                    direction={orderBy === 'maxWeeklyHours' ? order : 'asc'}
                    onClick={() => handleRequestSort('maxWeeklyHours')}
                  >
                    Max Weekly Hours
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No teachers found
                  </TableCell>
                </TableRow>
              ) : (
                sortedTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.phone || '-'}</TableCell>
                    <TableCell>{teacher.specialization || '-'}</TableCell>
                    <TableCell>{teacher.maxWeeklyHours}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditClick(teacher)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick(teacher)}
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

      {/* Add/Edit Teacher Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentTeacher ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Teacher Name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="specialization"
                label="Specialization"
                value={formData.specialization}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="maxWeeklyHours"
                label="Max Weekly Hours"
                type="number"
                value={formData.maxWeeklyHours}
                onChange={handleFormChange}
                fullWidth
                inputProps={{ min: 0 }}
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
            {currentTeacher ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the teacher "{currentTeacher?.name}"? This action cannot be undone.
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

export default TeachersPage;
