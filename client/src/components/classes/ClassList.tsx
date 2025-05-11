import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Class } from '../../types';

interface ClassListProps {
  classes: Class[];
  onEdit: (classItem: Class) => void;
  onDelete: (id: number) => void;
}

const ClassList: React.FC<ClassListProps> = ({ classes, onEdit, onDelete }) => {
  if (classes.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">No classes found. Add a new class to get started.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>Section</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {classes.map((classItem) => (
            <TableRow key={classItem.id}>
              <TableCell>{classItem.name}</TableCell>
              <TableCell>{classItem.grade || '-'}</TableCell>
              <TableCell>{classItem.section || '-'}</TableCell>
              <TableCell>{classItem.description || '-'}</TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Tooltip title="Edit">
                    <IconButton 
                      color="primary" 
                      onClick={() => onEdit(classItem)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      color="error" 
                      onClick={() => onDelete(classItem.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClassList;
