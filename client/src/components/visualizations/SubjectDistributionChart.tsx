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
  return `${label}: ${value} periods (${percentage}%)`;
};

const SubjectDistributionChart: React.FC<SubjectDistributionChartProps> = (props) => {
  const { schedule, subjects } = props;
  
  const [chartData, setChartData] = useState<ChartDataType>({
    labels: [],
    datasets: [
      {
        label: 'Hours per Subject',
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
    let title = 'Subject Distribution';
    
    if (schedule && schedule.data) {
      // Count subject occurrences from schedule
      schedule.data.forEach(day => {
        day.slots.forEach(slot => {
          if (slot.subject) {
            subjectCounts[slot.subject] = (subjectCounts[slot.subject] || 0) + 1;
          }
        });
      });
      title = `Subject Distribution for ${schedule.className}`;
    } else if (subjects && subjects.length > 0) {
      // Count subjects by weekly hours
      subjects.forEach(subject => {
        subjectCounts[subject.name] = subject.weeklyHours || 1;
      });
      title = 'Subject Distribution by Weekly Hours';
    } else {
      return; // No data to process
    }

    const subjectNames = Object.keys(subjectCounts);
    const counts = subjectNames.map(subject => subjectCounts[subject]);
    const backgroundColors = generateColors(subjectNames.length);
    const borderColors = backgroundColors.map(color => color.replace('0.8', '1'));

    setChartData({
      labels: subjectNames,
      datasets: [
        {
          label: 'Hours per Subject',
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
        {schedule ? `Subject Distribution for ${schedule.className}` : 'Subject Distribution by Weekly Hours'}
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
