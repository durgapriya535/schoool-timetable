import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { TimetableEntry, Teacher } from '../../types';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TeacherWorkloadChartProps {
  timetableEntries: TimetableEntry[];
  teachers: Teacher[];
}

const TeacherWorkloadChart: React.FC<TeacherWorkloadChartProps> = ({ timetableEntries, teachers }) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        label: 'Assigned Periods',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    if (!timetableEntries.length || !teachers.length) return;

    // Count periods per teacher
    const teacherPeriodCounts: Record<number, number> = {};
    
    timetableEntries.forEach(entry => {
      const teacherId = entry.teacher.id;
      teacherPeriodCounts[teacherId] = (teacherPeriodCounts[teacherId] || 0) + 1;
    });

    // Sort teachers by workload
    const sortedTeachers = [...teachers].sort((a, b) => {
      const countA = teacherPeriodCounts[a.id] || 0;
      const countB = teacherPeriodCounts[b.id] || 0;
      return countB - countA; // Sort by descending order
    });

    const teacherNames = sortedTeachers.map(teacher => teacher.name);
    const periodCounts = sortedTeachers.map(teacher => teacherPeriodCounts[teacher.id] || 0);

    setChartData({
      labels: teacherNames,
      datasets: [
        {
          label: 'Assigned Periods',
          data: periodCounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, [timetableEntries, teachers]);

  if (!timetableEntries.length || !teachers.length || chartData.labels.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No data available for teacher workload visualization</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Teacher Workload Distribution
      </Typography>
      <Box sx={{ height: 400 }}>
        <Bar 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Periods'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Teachers'
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.raw as number;
                    return `Assigned periods: ${value}`;
                  }
                }
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default TeacherWorkloadChart;
