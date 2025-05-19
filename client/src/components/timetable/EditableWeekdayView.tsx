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
  SelectChangeEvent
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

  const handleCellClick = (className: string, periodId: number, periodName: string, teacher: string | null, subject: string | null) => {
    setSelectedCell({
      className,
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
      // Find the class ID based on the name
      const classId = parseInt(selectedCell.className.split(' ')[1]); // Assuming format "Class X" where X is the ID
      
      await timetableService.create({
        classId,
        teacherId: parseInt(formData.teacherId),
        subjectId: parseInt(formData.subjectId),
        periodId: selectedCell.periodId,
        dayOfWeek: schedule.dayNumber
      });
      
      // Notify parent component to refresh the data
      onCellUpdate();
      handleDialogClose();
    } catch (error) {
      console.error('Error updating timetable:', error);
      // Could add error handling here
    }
  };

  // Helper function to get cell color based on subject
  const getCellColor = (subject: string | null) => {
    if (!subject) return '#ffffff'; // White for empty cells
    
    // Simple hash function to generate consistent colors for subjects
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate a light pastel color
    const h = hash % 360;
    return `hsl(${h}, 70%, 90%)`;
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
                    onClick={() => handleCellClick(
                      className, 
                      slot.periodId, 
                      slot.periodName, 
                      slot.teacher, 
                      slot.subject
                    )}
                    sx={{ 
                      backgroundColor: getCellColor(slot.subject),
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
