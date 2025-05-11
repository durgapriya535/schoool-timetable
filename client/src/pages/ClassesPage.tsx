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
  DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClassList from '../components/classes/ClassList';
import ClassForm from '../components/classes/ClassForm';
import { classService } from '../services/classService';
import { Class } from '../types';

const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getAll();
      setClasses(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClick = () => {
    setEditingClass(undefined);
    setShowForm(true);
  };

  const handleEditClick = (classItem: Class) => {
    setEditingClass(classItem);
    setShowForm(true);
  };

  const handleDeleteClick = (id: number) => {
    setClassToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Class, 'id'>) => {
    try {
      setLoading(true);
      if (editingClass) {
        await classService.update(editingClass.id, data);
      } else {
        await classService.create(data);
      }
      setShowForm(false);
      fetchClasses();
    } catch (err) {
      console.error('Error saving class:', err);
      setError('Failed to save class. Please try again.');
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleDeleteConfirm = async () => {
    if (classToDelete !== null) {
      try {
        setLoading(true);
        await classService.delete(classToDelete);
        setDeleteDialogOpen(false);
        setClassToDelete(null);
        fetchClasses();
      } catch (err) {
        console.error('Error deleting class:', err);
        setError('Failed to delete class. Please try again.');
        setLoading(false);
        setDeleteDialogOpen(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Classes</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Class
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {showForm && (
        <ClassForm 
          initialData={editingClass} 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormCancel} 
        />
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ClassList 
          classes={classes} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick} 
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this class? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassesPage;
