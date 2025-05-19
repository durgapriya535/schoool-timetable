import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  Alert
} from '@mui/material';

import { WeekdaySchedule, Teacher, Subject } from '../../types';
import { timetableService } from '../../services/timetableService';

interface EditableWeekdayViewProps {
  schedule: WeekdaySchedule;
  teachers: Teacher[];
  subjects: Subject[];
  onCellUpdate: () => void;
}

const EditableWeekdayView: React.FC<EditableWeekdayViewProps> = ({ 
  schedule, 
  teachers, 
  subjects,
  onCellUpdate
}) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{
    className: string;
    classId: number;
    periodId: number;
    periodName: string;
    currentTeacher: string | null;
    currentSubject: string | null;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    teacherId: false,
    subjectId: false
  });
  
  // State for error message to display in the dialog
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when dialog opens with a new cell
  useEffect(() => {
    if (selectedCell) {
      // Find the teacher ID based on the name
      const teacherId = selectedCell.currentTeacher 
        ? teachers.find(t => t.name === selectedCell.currentTeacher)?.id.toString() || ''
        : '';
      
      // Find the subject ID based on the name
      const subjectId = selectedCell.currentSubject
        ? subjects.find(s => s.name === selectedCell.currentSubject)?.id.toString() || ''
        : '';
      
      setFormData({
        teacherId,
        subjectId
      });
      
      setFormErrors({
        teacherId: false,
        subjectId: false
      });
    }
  }, [selectedCell, teachers, subjects]);

  const handleCellClick = (className: string, classId: number, periodId: number, periodName: string, teacher: string | null, subject: string | null) => {
    setSelectedCell({
      className,
      classId,
      periodId,
      periodName,
      currentTeacher: teacher,
      currentSubject: subject
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCell(null);
    // Clear any error messages when closing the dialog
    setErrorMessage(null);
  };

  const handleFormChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is filled
    if (value) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      teacherId: !formData.teacherId,
      subjectId: !formData.subjectId
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedCell) return;
    
    try {
      // Get all required data from state
      const classId = selectedCell.classId;
      const periodId = selectedCell.periodId;
      const dayOfWeek = schedule.dayNumber;
      
      // Convert string IDs to integers
      const teacherId = parseInt(formData.teacherId);
      const subjectId = parseInt(formData.subjectId);
      
      // Ensure all required fields are provided
      if (!classId || !teacherId || !subjectId || !periodId || !dayOfWeek) {
        setErrorMessage('All fields are required');
        return;
      }
      
      // Prepare data for API call
      const timetableData = {
        classId,
        teacherId,
        subjectId,
        periodId,
        dayOfWeek
      };
      // Check if the cell already has a teacher or subject assigned
      if (selectedCell.currentTeacher || selectedCell.currentSubject) {
        // Update existing entry
        const entries = await timetableService.getByClass(timetableData.classId);
        const existingEntry = entries.find(entry => 
          entry.dayOfWeek === timetableData.dayOfWeek && 
          entry.period && entry.period.id === timetableData.periodId
        );
        
        if (existingEntry) {
          // Update the existing entry
          await timetableService.update(existingEntry.id, {
            teacherId: timetableData.teacherId,
            subjectId: timetableData.subjectId,
            dayOfWeek: timetableData.dayOfWeek
          });
        } else {
          // Fallback to create if entry not found
          await timetableService.create(timetableData);
        }
      } else {
        // No existing entry, create a new one
        await timetableService.create(timetableData);
      }
      
      // Notify parent component to refresh the data
      onCellUpdate();
      handleDialogClose();
    } catch (error: any) {
      console.error('Error updating timetable:', error);
      
      // Check if it's a 409 conflict error
      if (error.response && error.response.status === 409) {
        // Extract and display the specific error message from the server
        const serverMessage = error.response.data?.message || 'Scheduling conflict detected';
        setErrorMessage(serverMessage);
        // Don't close the dialog so the user can correct the issue
      } else {
        // For other errors, show an alert and close the dialog
        alert(`Failed to save timetable entry: ${error.message || 'Unknown error'}. Please check the console for details.`);
        handleDialogClose();
      }
    }
  };

  // Helper function to get cell color based on subject
  const getCellColor = (subject: string | null, subjectColor: string | null) => {
    if (!subject) return '#ffffff'; // White for empty cells
    if (subjectColor) return subjectColor; // Use the color from the database if available
    
    // Fallback to default color if no color is specified
    return '#3788d8';
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Class</TableCell>
              {schedule.periods.map((period) => (
                <TableCell key={period} sx={{ fontWeight: 'bold', minWidth: 150 }}>
                  {period}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.classes.map((className) => (
              <TableRow key={className}>
                <TableCell sx={{ fontWeight: 'bold' }}>{className}</TableCell>
                {schedule.slots[className].map((slot, index) => (
                  <TableCell 
                    key={index}
                    onClick={() => {
                      // Use className from the outer loop and class property from the slot
                      handleCellClick(
                        slot.class!, // Use className from the outer loop instead of slot.className
                        slot.classId!, // Use non-null assertion since we know it's not null
                        slot.periodId, 
                        slot.periodName, 
                        slot.teacher, 
                        slot.subject
                      );
                    }}
                    sx={{ 
                      backgroundColor: getCellColor(slot.subject, slot.subjectColor || null),
                      p: 1,
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                        boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    {slot.subject ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {slot.subject}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {slot.teacher || 'No teacher'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Click to add
                      </Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for editing cell */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCell ? (
            `Edit Schedule: ${selectedCell.className} - ${selectedCell.periodName}`
          ) : (
            'Edit Schedule'
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Display error message if present */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            <FormControl fullWidth margin="normal" error={formErrors.subjectId}>
              <InputLabel id="edit-subject-label">Subject</InputLabel>
              <Select
                labelId="edit-subject-label"
                name="subjectId"
                value={formData.subjectId}
                label="Subject"
                onChange={handleFormChange}
              >
                <MenuItem value="">
                  <em>Select a subject</em>
                </MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.subjectId && <FormHelperText>Subject is required</FormHelperText>}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formErrors.teacherId}>
              <InputLabel id="edit-teacher-label">Teacher</InputLabel>
              <Select
                labelId="edit-teacher-label"
                name="teacherId"
                value={formData.teacherId}
                label="Teacher"
                onChange={handleFormChange}
              >
                <MenuItem value="">
                  <em>Select a teacher</em>
                </MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id.toString()}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.teacherId && <FormHelperText>Teacher is required</FormHelperText>}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditableWeekdayView;
