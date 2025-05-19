import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { timetableService } from '../services/timetableService';
import { teacherService } from '../services/teacherService';
import { subjectService } from '../services/subjectService';
import { WeekdaySchedule, Teacher, Subject } from '../types';
import EditableWeekdayView from '../components/timetable/EditableWeekdayView';

const WeekdaySchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<WeekdaySchedule | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday by default
  
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch schedule, teachers, and subjects in parallel
      const [scheduleData, teachersData, subjectsData] = await Promise.all([
        timetableService.getWeekdaySchedule(selectedDay),
        teacherService.getAll(),
        subjectService.getAll()
      ]);
      
      setSchedule(scheduleData);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);
  
  useEffect(() => {
    fetchData();
  }, [selectedDay, fetchData]);
  
  const handleDayChange = (event: SelectChangeEvent<number>) => {
    setSelectedDay(event.target.value as number);
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
        <EditableWeekdayView 
          schedule={schedule} 
          teachers={teachers}
          subjects={subjects}
          onCellUpdate={fetchData}
        />
      ) : (
        <Alert severity="info">
          No schedule data available for {weekdays[selectedDay - 1]}.
        </Alert>
      )}
    </Box>
  );
};

export default WeekdaySchedulePage;
