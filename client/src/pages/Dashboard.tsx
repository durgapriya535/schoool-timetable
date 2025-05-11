import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  CircularProgress,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import AddIcon from '@mui/icons-material/Add';
import { classService } from '../services/classService';
import { teacherService } from '../services/teacherService';
import { subjectService } from '../services/subjectService';
import { periodService } from '../services/periodService';
import { timetableService } from '../services/timetableService';
import { Class, Teacher, Subject, Period, TimetableEntry } from '../types';
import TeacherWorkloadChart from '../components/visualizations/TeacherWorkloadChart';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    classes: 0,
    teachers: 0,
    subjects: 0,
    periods: 0,
    timetableEntries: 0
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [recentEntities, setRecentEntities] = useState<{type: string, name: string, time: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data
        const [classesData, teachersData, subjectsData, periodsData, timetablesData] = await Promise.all([
          classService.getAll(),
          teacherService.getAll(),
          subjectService.getAll(),
          periodService.getAll(),
          timetableService.getAll()
        ]);

        setStats({
          classes: classesData.length,
          teachers: teachersData.length,
          subjects: subjectsData.length,
          periods: periodsData.length,
          timetableEntries: timetablesData.length
        });

        setClasses(classesData);
        setTeachers(teachersData);
        setSubjects(subjectsData);
        setPeriods(periodsData);
        setTimetableEntries(timetablesData);

        // Create mock recent activities (since we don't have timestamps in our simple backend)
        const mockRecentActivities = [];
        if (classesData.length > 0) {
          mockRecentActivities.push({
            type: 'class',
            name: classesData[classesData.length - 1].name,
            time: '10 minutes ago'
          });
        }
        if (teachersData.length > 0) {
          mockRecentActivities.push({
            type: 'teacher',
            name: teachersData[teachersData.length - 1].name,
            time: '25 minutes ago'
          });
        }
        if (subjectsData.length > 0) {
          mockRecentActivities.push({
            type: 'subject',
            name: subjectsData[subjectsData.length - 1].name,
            time: '1 hour ago'
          });
        }
        setRecentEntities(mockRecentActivities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (count: number) => {
    if (count === 0) return 'error.main';
    if (count < 3) return 'warning.main';
    return 'success.main';
  };

  const getStatusText = (count: number) => {
    if (count === 0) return 'Not Started';
    if (count < 3) return 'In Progress';
    return 'Good';
  };

  const getIconForEntityType = (type: string) => {
    switch (type) {
      case 'class': return <ClassIcon />;
      case 'teacher': return <PersonIcon />;
      case 'subject': return <SubjectIcon />;
      case 'period': return <AccessTimeIcon />;
      default: return <CalendarViewWeekIcon />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">School Timetable Dashboard</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="Classes" 
              action={
                <Chip 
                  label={getStatusText(stats.classes)} 
                  sx={{ bgcolor: getStatusColor(stats.classes), color: 'white' }} 
                />
              }
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h3" align="center" sx={{ mb: 2 }}>
                {stats.classes}
              </Typography>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/classes"
              >
                Manage Classes
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="Teachers" 
              action={
                <Chip 
                  label={getStatusText(stats.teachers)} 
                  sx={{ bgcolor: getStatusColor(stats.teachers), color: 'white' }} 
                />
              }
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h3" align="center" sx={{ mb: 2 }}>
                {stats.teachers}
              </Typography>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/teachers"
              >
                Manage Teachers
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="Subjects" 
              action={
                <Chip 
                  label={getStatusText(stats.subjects)} 
                  sx={{ bgcolor: getStatusColor(stats.subjects), color: 'white' }} 
                />
              }
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h3" align="center" sx={{ mb: 2 }}>
                {stats.subjects}
              </Typography>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/subjects"
              >
                Manage Subjects
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="Periods" 
              action={
                <Chip 
                  label={getStatusText(stats.periods)} 
                  sx={{ bgcolor: getStatusColor(stats.periods), color: 'white' }} 
                />
              }
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h3" align="center" sx={{ mb: 2 }}>
                {stats.periods}
              </Typography>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/periods"
              >
                Manage Periods
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Timetable Status</Typography>
            <Divider sx={{ mb: 2 }} />
            {stats.timetableEntries > 0 ? (
              <Box sx={{ mt: 2 }}>
                <TeacherWorkloadChart 
                  timetableEntries={timetableEntries} 
                  teachers={teachers} 
                />
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    component={RouterLink}
                    to="/timetable"
                  >
                    View Full Timetable
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No timetable entries found. Start creating your timetable by adding classes, subjects, teachers, and periods.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  component={RouterLink}
                  to="/timetable"
                  sx={{ mt: 2 }}
                >
                  Create Timetable
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <Divider sx={{ mb: 2 }} />
            {recentEntities.length > 0 ? (
              <List>
                {recentEntities.map((activity, index) => (
                  <ListItem key={index} divider={index < recentEntities.length - 1}>
                    <ListItemIcon>
                      {getIconForEntityType(activity.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Added ${activity.type}: ${activity.name}`}
                      secondary={activity.time}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No recent activity found.
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<ClassIcon />}
                  component={RouterLink}
                  to="/classes"
                >
                  Add Class
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<SubjectIcon />}
                  component={RouterLink}
                  to="/subjects"
                >
                  Add Subject
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<PersonIcon />}
                  component={RouterLink}
                  to="/teachers"
                >
                  Add Teacher
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<AccessTimeIcon />}
                  component={RouterLink}
                  to="/periods"
                >
                  Add Period
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
