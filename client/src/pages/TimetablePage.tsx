import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { classService } from '../services/classService';
import { teacherService } from '../services/teacherService';
import { subjectService } from '../services/subjectService';
import { periodService } from '../services/periodService';
import { timetableService } from '../services/timetableService';
import { Class, Teacher, Subject, Period, ClassSchedule, TeacherSchedule, WeekdaySchedule, Timetable } from '../types';
import TimetableGrid from '../components/visualizations/TimetableGrid';
import SubjectDistributionChart from '../components/visualizations/SubjectDistributionChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`timetable-tabpanel-${index}`}
      aria-labelledby={`timetable-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TimetablePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1); // Monday by default
  const [classSchedule, setClassSchedule] = useState<ClassSchedule | null>(null);
  const [teacherSchedule, setTeacherSchedule] = useState<TeacherSchedule | null>(null);
  const [weekdaySchedule, setWeekdaySchedule] = useState<WeekdaySchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [conflictInfo, setConflictInfo] = useState<{
    type: 'teacher' | 'class' | null;
    entry: Timetable | null;
  }>({ type: null, entry: null });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    periodId: '',
    dayOfWeek: ''
  });
  const [formErrors, setFormErrors] = useState({
    classId: false,
    subjectId: false,
    teacherId: false,
    periodId: false,
    dayOfWeek: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classesData, teachersData, subjectsData, periodsData] = await Promise.all([
          classService.getAll(),
          teacherService.getAll(),
          subjectService.getAll(),
          periodService.getAll()
        ]);
        
        setClasses(classesData);
        setTeachers(teachersData);
        setSubjects(subjectsData);
        setPeriods(periodsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchClassSchedule = async () => {
      if (selectedClassId) {
        try {
          setLoading(true);
          const data = await timetableService.getClassSchedule(Number(selectedClassId));
          setClassSchedule(data);
          setError(null);
        } catch (err) {
          console.error('Error fetching class schedule:', err);
          setError('Failed to load class schedule. Please try again later.');
          setClassSchedule(null);
        } finally {
          setLoading(false);
        }
      } else {
        setClassSchedule(null);
      }
    };

    fetchClassSchedule();
  }, [selectedClassId]);

  useEffect(() => {
    const fetchTeacherSchedule = async () => {
      if (selectedTeacherId) {
        try {
          setLoading(true);
          const data = await timetableService.getTeacherSchedule(Number(selectedTeacherId));
          setTeacherSchedule(data);
          setError(null);
        } catch (err) {
          console.error('Error fetching teacher schedule:', err);
          setError('Failed to load teacher schedule. Please try again later.');
          setTeacherSchedule(null);
        } finally {
          setLoading(false);
        }
      } else {
        setTeacherSchedule(null);
      }
    };

    fetchTeacherSchedule();
  }, [selectedTeacherId]);

  useEffect(() => {
    const fetchWeekdaySchedule = async () => {
      try {
        setLoading(true);
        const data = await timetableService.getWeekdaySchedule(selectedDayOfWeek);
        setWeekdaySchedule(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching weekday schedule:', err);
        setError('Failed to load weekday schedule. Please try again later.');
        setWeekdaySchedule(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekdaySchedule();
  }, [selectedDayOfWeek]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClassChange = (event: SelectChangeEvent<number | ''>) => {
    setSelectedClassId(event.target.value as number | '');
  };

  const handleTeacherChange = (event: SelectChangeEvent<number | ''>) => {
    setSelectedTeacherId(event.target.value as number | '');
  };

  const handleDayOfWeekChange = (event: SelectChangeEvent<number>) => {
    setSelectedDayOfWeek(event.target.value as number);
  };

  const handleAddTimetableClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleFormChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: false
      });
    }
  };

  const validateForm = () => {
    const errors = {
      classId: !formData.classId,
      subjectId: !formData.subjectId,
      teacherId: !formData.teacherId,
      periodId: !formData.periodId,
      dayOfWeek: !formData.dayOfWeek
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const resetForm = () => {
    setFormData({
      classId: '',
      subjectId: '',
      teacherId: '',
      periodId: '',
      dayOfWeek: ''
    });
    setFormErrors({
      classId: false,
      subjectId: false,
      teacherId: false,
      periodId: false,
      dayOfWeek: false
    });
    setError(null);
    setConflictInfo({ type: null, entry: null });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await timetableService.create({
        classId: Number(formData.classId),
        subjectId: Number(formData.subjectId),
        teacherId: Number(formData.teacherId),
        periodId: Number(formData.periodId),
        dayOfWeek: Number(formData.dayOfWeek)
      });
      
      setDialogOpen(false);
      resetForm();
      
      // Refresh the current view
      if (tabValue === 0 && selectedClassId) {
        const data = await timetableService.getClassSchedule(Number(selectedClassId));
        setClassSchedule(data);
      } else if (tabValue === 1 && selectedTeacherId) {
        const data = await timetableService.getTeacherSchedule(Number(selectedTeacherId));
        setTeacherSchedule(data);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error creating timetable entry:', err);
      setError(err.response?.data?.message || 'Failed to create timetable entry. Please try again.');
      
      // Handle conflict information if available
      if (err.response?.data?.conflictType && err.response?.data?.conflictingEntry) {
        setConflictInfo({
          type: err.response.data.conflictType,
          entry: err.response.data.conflictingEntry
        });
      } else {
        setConflictInfo({ type: null, entry: null });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Timetable Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddTimetableClick}
        >
          Add Timetable Entry
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Class Timetable" />
          <Tab label="Teacher Timetable" />
          <Tab label="Weekday View" />
          <Tab label="Analytics" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id="class-select-label">Select Class</InputLabel>
            <Select
              labelId="class-select-label"
              id="class-select"
              value={selectedClassId}
              label="Select Class"
              onChange={handleClassChange}
            >
              <MenuItem value="">
                <em>Select a class</em>
              </MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {classSchedule ? (
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <TimetableGrid schedule={classSchedule} type="class" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <SubjectDistributionChart schedule={classSchedule} />
                  </Grid>
                </Grid>
              ) : (
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>
                    {selectedClassId 
                      ? 'No timetable data available for this class.' 
                      : 'Please select a class to view its timetable.'}
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id="teacher-select-label">Select Teacher</InputLabel>
            <Select
              labelId="teacher-select-label"
              id="teacher-select"
              value={selectedTeacherId}
              label="Select Teacher"
              onChange={handleTeacherChange}
            >
              <MenuItem value="">
                <em>Select a teacher</em>
              </MenuItem>
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {teacherSchedule ? (
                <TimetableGrid schedule={teacherSchedule} type="teacher" />
              ) : (
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>
                    {selectedTeacherId 
                      ? 'No timetable data available for this teacher.' 
                      : 'Please select a teacher to view their timetable.'}
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  Weekday Schedule View
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  View the complete timetable for all classes on a specific day of the week
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="day-select-label">Day of Week</InputLabel>
                  <Select
                    labelId="day-select-label"
                    id="day-select"
                    value={selectedDayOfWeek}
                    label="Day of Week"
                    onChange={handleDayOfWeekChange}
                  >
                    <MenuItem value={1}>Monday</MenuItem>
                    <MenuItem value={2}>Tuesday</MenuItem>
                    <MenuItem value={3}>Wednesday</MenuItem>
                    <MenuItem value={4}>Thursday</MenuItem>
                    <MenuItem value={5}>Friday</MenuItem>
                    <MenuItem value={6}>Saturday</MenuItem>
                    <MenuItem value={7}>Sunday</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : weekdaySchedule ? (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Class</TableCell>
                    {weekdaySchedule.periods.map((period) => (
                      <TableCell key={period} sx={{ fontWeight: 'bold', minWidth: 150 }}>
                        {period}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weekdaySchedule.classes.map((className) => (
                    <TableRow key={className}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{className}</TableCell>
                      {weekdaySchedule.slots[className].map((slot, index) => (
                        <TableCell 
                          key={index}
                          sx={{ 
                            backgroundColor: slot.subject ? '#e3f2fd' : '#ffffff',
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
              No schedule data available for the selected day.
            </Alert>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Subject Distribution
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : subjects.length > 0 ? (
              <SubjectDistributionChart subjects={subjects} />
            ) : (
              <Alert severity="info">No subject data available.</Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Timetable Entry</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              {conflictInfo.entry && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Conflict Details:
                  </Typography>
                  <Typography variant="body2">
                    {conflictInfo.type === 'teacher' ? 'Teacher is already assigned to:' : 'Class already has:'}
                  </Typography>
                  <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                    <li>Class: {conflictInfo.entry.class?.name || 'N/A'}</li>
                    <li>Subject: {conflictInfo.entry.subject?.name || 'N/A'}</li>
                    <li>Teacher: {conflictInfo.entry.teacher?.name || 'N/A'}</li>
                    <li>Period: {conflictInfo.entry.period?.name || 'N/A'}</li>
                    <li>Day: {conflictInfo.entry.dayOfWeek ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][conflictInfo.entry.dayOfWeek - 1] : 'N/A'}</li>
                  </Box>
                </Box>
              )}
            </Alert>
          )}
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal" error={formErrors.classId}>
              <InputLabel id="form-class-label">Class</InputLabel>
              <Select
                labelId="form-class-label"
                name="classId"
                value={formData.classId}
                label="Class"
                onChange={handleFormChange}
              >
                <MenuItem value="">
                  <em>Select a class</em>
                </MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.classId && <FormHelperText>Class is required</FormHelperText>}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formErrors.subjectId}>
              <InputLabel id="form-subject-label">Subject</InputLabel>
              <Select
                labelId="form-subject-label"
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
              <InputLabel id="form-teacher-label">Teacher</InputLabel>
              <Select
                labelId="form-teacher-label"
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

            <FormControl fullWidth margin="normal" error={formErrors.periodId}>
              <InputLabel id="form-period-label">Period</InputLabel>
              <Select
                labelId="form-period-label"
                name="periodId"
                value={formData.periodId}
                label="Period"
                onChange={handleFormChange}
              >
                <MenuItem value="">
                  <em>Select a period</em>
                </MenuItem>
                {periods.map((period) => (
                  <MenuItem key={period.id} value={period.id.toString()}>
                    {period.name} ({period.startTime} - {period.endTime})
                  </MenuItem>
                ))}
              </Select>
              {formErrors.periodId && <FormHelperText>Period is required</FormHelperText>}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formErrors.dayOfWeek}>
              <InputLabel id="form-day-label">Day of Week</InputLabel>
              <Select
                labelId="form-day-label"
                name="dayOfWeek"
                value={formData.dayOfWeek}
                label="Day of Week"
                onChange={handleFormChange}
              >
                <MenuItem value="">
                  <em>Select a day</em>
                </MenuItem>
                <MenuItem value="1">Monday</MenuItem>
                <MenuItem value="2">Tuesday</MenuItem>
                <MenuItem value="3">Wednesday</MenuItem>
                <MenuItem value="4">Thursday</MenuItem>
                <MenuItem value="5">Friday</MenuItem>
                <MenuItem value="6">Saturday</MenuItem>
                <MenuItem value="7">Sunday</MenuItem>
              </Select>
              {formErrors.dayOfWeek && <FormHelperText>Day of week is required</FormHelperText>}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Add Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimetablePage;
