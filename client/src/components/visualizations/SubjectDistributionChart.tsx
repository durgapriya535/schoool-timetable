import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ClassSchedule, Subject } from '../../types';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

type ChartDataType = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
};

interface SubjectDistributionChartProps {
  schedule?: ClassSchedule;
  subjects?: Subject[];
}

// Generate colors for chart
const generateColors = (count: number): string[] => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137) % 360; // Use golden angle approximation for good distribution
    colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
  }
  return colors;
};

// Format tooltip label
const formatLabel = (context: any) => {
  const label = context.label || '';
  const value = context.raw as number;
  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
  const percentage = Math.round((value / total) * 100);
  return `${label}: ${value} periods per week (${percentage}%)`;
};

const SubjectDistributionChart: React.FC<SubjectDistributionChartProps> = (props) => {
  // Destructure props but prioritize schedule over subjects
  const { schedule, subjects } = props;
  
  // For debugging
  console.log('SubjectDistributionChart received props:', { 
    hasSchedule: !!schedule, 
    scheduleData: schedule?.data,
    hasSubjects: !!subjects
  });
  
  const [chartData, setChartData] = useState<ChartDataType>({
    labels: [],
    datasets: [
      {
        label: 'Periods per Week',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    // Handle different data sources
    const subjectCounts: Record<string, number> = {};
    let title = 'Subject Periods per Week';
    
    // CRITICAL FIX: Always clear previous data before processing
    // This ensures we don't mix data from different sources
    
    // STEP 1: Check if we have valid schedule data with actual timetable entries
    if (schedule && schedule.data && schedule.data.length > 0) {
      // Count actual periods from the timetable
      let hasAnySubjects = false;
      
      // Process each day in the schedule
      schedule.data.forEach(day => {
        // Process each slot in the day
        day.slots.forEach(slot => {
          if (slot.subject) {
            subjectCounts[slot.subject] = (subjectCounts[slot.subject] || 0) + 1;
            hasAnySubjects = true;
          }
        });
      });
      
      // If we found any subjects in the schedule, use this data
      if (hasAnySubjects) {
        title = `Subject Periods per Week for ${schedule.className}`;
        console.log('Using ACTUAL TIMETABLE DATA for chart:', subjectCounts);
      } else {
        // If schedule exists but has no subjects, fall back to subjects data
        if (subjects && subjects.length > 0) {
          // Clear the counts since we're switching data sources
          Object.keys(subjectCounts).forEach(key => delete subjectCounts[key]);
          
          // Use weekly hours from subjects data
          subjects.forEach(subject => {
            subjectCounts[subject.name] = subject.weeklyHours || 0;
          });
          title = 'Subject Periods per Week (Planned)';
          console.log('Schedule has no subjects, using weekly hours:', subjectCounts);
        } else {
          return; // No data to process
        }
      }
    } 
    // STEP 2: If no schedule data, fall back to subjects weekly hours
    else if (subjects && subjects.length > 0) {
      // Use weekly hours from subjects data
      subjects.forEach(subject => {
        subjectCounts[subject.name] = subject.weeklyHours || 0;
      });
      title = 'Subject Periods per Week (Planned)';
      console.log('No schedule data, using weekly hours:', subjectCounts);
    } else {
      console.log('No data available for chart');
      return; // No data to process
    }

    const subjectNames = Object.keys(subjectCounts);
    const counts = subjectNames.map(subject => subjectCounts[subject]);
    
    // Use subject colors from the database if available
    let backgroundColors: string[] = [];
    
    // First try to get colors from schedule data if it includes subjectColor
    if (schedule && schedule.data) {
      const subjectColorMap: Record<string, string> = {};
      
      // Extract subject colors from schedule data
      schedule.data.forEach(day => {
        day.slots.forEach(slot => {
          if (slot.subject && slot.subjectColor) {
            subjectColorMap[slot.subject] = slot.subjectColor;
          }
        });
      });
      
      // Use the extracted colors for chart
      if (Object.keys(subjectColorMap).length > 0) {
        backgroundColors = subjectNames.map(name => 
          subjectColorMap[name] ? `${subjectColorMap[name]}CC` : `#3788d8CC`
        );
      }
    }
    
    // If no colors were found in schedule data, try to get them from subjects prop
    if (backgroundColors.length === 0 && subjects && subjects.length > 0) {
      backgroundColors = subjectNames.map(name => {
        const subject = subjects.find(s => s.name === name);
        return subject?.color ? `${subject.color}CC` : `#3788d8CC`; // CC adds 80% opacity
      });
    }
    
    // Fallback to generated colors if no colors were found
    if (backgroundColors.length === 0) {
      backgroundColors = generateColors(subjectNames.length);
    }
    
    const borderColors = backgroundColors.map(color => 
      color.endsWith('CC') ? color.substring(0, color.length - 2) : color
    );

    setChartData({
      labels: subjectNames,
      datasets: [
        {
          label: 'Periods per Week',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    });
  }, [schedule, subjects]);

  if (chartData.labels.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No data available for chart visualization</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {schedule ? `Subject Periods per Week for ${schedule.className}` : 'Subject Periods per Week'}
      </Typography>
      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <Pie 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
              },
              tooltip: {
                callbacks: {
                  label: formatLabel
                }
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default SubjectDistributionChart;
