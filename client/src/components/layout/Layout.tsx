import React from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Container>
          <Box sx={{ py: 2 }}>
            School Timetable Manager &copy; {new Date().getFullYear()}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
