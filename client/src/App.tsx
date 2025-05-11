import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ClassesPage from './pages/ClassesPage';
import SubjectsPage from './pages/SubjectsPage';
import TeachersPage from './pages/TeachersPage';
import PeriodsPage from './pages/PeriodsPage';
import TimetablePage from './pages/TimetablePage';
import WeekdaySchedulePage from './pages/WeekdaySchedulePage';
import DebugPage from './pages/DebugPage';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/periods" element={<PeriodsPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/weekday-schedule" element={<WeekdaySchedulePage />} />
            <Route path="/debug" element={<DebugPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
