import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <SchoolIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          School Timetable Manager
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/classes">
            Classes
          </Button>
          <Button color="inherit" component={RouterLink} to="/subjects">
            Subjects
          </Button>
          <Button color="inherit" component={RouterLink} to="/teachers">
            Teachers
          </Button>
          <Button color="inherit" component={RouterLink} to="/periods">
            Periods
          </Button>
          <Button color="inherit" component={RouterLink} to="/timetable">
            Timetable
          </Button>
          <Button color="inherit" component={RouterLink} to="/weekday-schedule">
            Weekday Schedule
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
