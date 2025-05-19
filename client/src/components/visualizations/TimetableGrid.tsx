import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip
} from '@mui/material';
import { ClassSchedule, TeacherSchedule } from '../../types';

interface TimetableGridProps {
  schedule: ClassSchedule | TeacherSchedule;
  type: 'class' | 'teacher';
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ schedule, type }) => {
  const title = type === 'class' 
    ? `Class Schedule: ${(schedule as ClassSchedule).className}` 
    : `Teacher Schedule: ${(schedule as TeacherSchedule).teacherName}`;

  // Get weekdays including Saturday (Monday to Saturday)
  const weekdays = schedule.days.slice(0, 6);
  
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {title}
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Period / Day</TableCell>
              {weekdays.map((day) => (
                <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.periods.map((periodName, periodIndex) => (
              <TableRow key={periodName} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                  {periodName}
                </TableCell>
                
                {weekdays.map((day, dayIndex) => {
                  const slot = schedule.data[dayIndex].slots[periodIndex];
                  
                  return (
                    <TableCell key={`${day}-${periodName}`} align="center" sx={{ p: 1 }}>
                      {slot && (type === 'class' ? slot.subject : slot.class) ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip 
                            label={type === 'class' ? slot.subject : slot.class} 
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: type === 'class' && slot.subjectColor ? slot.subjectColor : '#3788d8',
                              color: '#fff'
                            }}
                          />
                          <Typography variant="caption" display="block">
                            {type === 'class' ? slot.teacher : slot.subject}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TimetableGrid;
