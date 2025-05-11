import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { timetableService } from '../services/timetableService';
import { WeekdaySchedule } from '../types';

const WeekdaySchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<WeekdaySchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday by default
  
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const fetchWeekdaySchedule = async (dayOfWeek: number) => {
    try {
      setLoading(true);
      const data = await timetableService.getWeekdaySchedule(dayOfWeek);
      setSchedule(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching weekday schedule:', err);
      setError('Failed to load weekday schedule. Please try again later.');
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWeekdaySchedule(selectedDay);
  }, [selectedDay]);
  
  const handleDayChange = (event: SelectChangeEvent<number>) => {
    setSelectedDay(event.target.value as number);
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Weekday Schedule</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="day-select-label">Day</InputLabel>
          <Select
            labelId="day-select-label"
            id="day-select"
            value={selectedDay}
            label="Day"
            onChange={handleDayChange}
          >
            {weekdays.map((day, index) => (
              <MenuItem key={index + 1} value={index + 1}>{day}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : schedule ? (
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
                      sx={{ 
                        backgroundColor: getCellColor(slot.subject),
                        p: 1,
                        border: '1px solid #e0e0e0'
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
                          No class
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          No schedule data available for {weekdays[selectedDay - 1]}.
        </Alert>
      )}
    </Box>
  );
};

export default WeekdaySchedulePage;
