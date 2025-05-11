import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Alert
} from '@mui/material';
import { timetableService } from '../services/timetableService';

const DebugPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('weekday');
  const [paramValue, setParamValue] = useState<string>('1');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleEndpointChange = (event: SelectChangeEvent) => {
    setSelectedEndpoint(event.target.value);
  };

  const handleParamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParamValue(event.target.value);
  };

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let result;
      
      switch (selectedEndpoint) {
        case 'weekday':
          result = await timetableService.getWeekdaySchedule(parseInt(paramValue));
          break;
        case 'class':
          result = await timetableService.getClassSchedule(parseInt(paramValue));
          break;
        case 'teacher':
          result = await timetableService.getTeacherSchedule(parseInt(paramValue));
          break;
        default:
          throw new Error('Invalid endpoint');
      }
      
      setResponse(result);
    } catch (err: any) {
      console.error('Debug error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>API Endpoint Debugger</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Endpoint</InputLabel>
            <Select
              value={selectedEndpoint}
              label="Endpoint"
              onChange={handleEndpointChange}
            >
              <MenuItem value="weekday">Weekday Schedule</MenuItem>
              <MenuItem value="class">Class Schedule</MenuItem>
              <MenuItem value="teacher">Teacher Schedule</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label={selectedEndpoint === 'weekday' ? 'Day (1-7)' : 'ID'}
            value={paramValue}
            onChange={handleParamChange}
            type="number"
            sx={{ minWidth: 120 }}
          />
          
          <Button 
            variant="contained" 
            onClick={testEndpoint}
            disabled={loading}
          >
            Test Endpoint
          </Button>
        </Box>
        
        {loading && <Typography>Loading...</Typography>}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {response && (
          <Box>
            <Typography variant="h6" gutterBottom>Response:</Typography>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                maxHeight: 500, 
                overflow: 'auto',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                fontSize: '0.875rem'
              }}
            >
              {JSON.stringify(response, null, 2)}
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DebugPage;
