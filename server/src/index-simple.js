const express = require('express');
const cors = require('cors');

// Create express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Empty data arrays
const classes = [];
const subjects = [];
const teachers = [];
const periods = [];
const timetableEntries = [];

// Routes for classes
app.get('/api/classes', (req, res) => {
  res.json(classes);
});

app.get('/api/classes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const classItem = classes.find(c => c.id === id);
  if (!classItem) {
    return res.status(404).json({ message: 'Class not found' });
  }
  res.json(classItem);
});

app.post('/api/classes', (req, res) => {
  const { name, grade, section, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Class name is required' });
  }
  const newClass = {
    id: classes.length + 1,
    name,
    grade,
    section,
    description
  };
  classes.push(newClass);
  res.status(201).json(newClass);
});

app.put('/api/classes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, grade, section, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Class name is required' });
  }
  
  const classIndex = classes.findIndex(c => c.id === id);
  if (classIndex === -1) {
    return res.status(404).json({ message: 'Class not found' });
  }
  
  const updatedClass = {
    id,
    name,
    grade,
    section,
    description
  };
  
  classes[classIndex] = updatedClass;
  res.json(updatedClass);
});

app.delete('/api/classes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const classIndex = classes.findIndex(c => c.id === id);
  
  if (classIndex === -1) {
    return res.status(404).json({ message: 'Class not found' });
  }
  
  // Check if class is used in timetable
  const isUsed = timetableEntries.some(entry => entry.classId === id);
  if (isUsed) {
    return res.status(400).json({ 
      message: 'Cannot delete class as it is used in the timetable' 
    });
  }
  
  classes.splice(classIndex, 1);
  res.status(204).send();
});

// Routes for subjects
app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

app.get('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const subject = subjects.find(s => s.id === id);
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  res.json(subject);
});

app.post('/api/subjects', (req, res) => {
  const { name, code, description, weeklyHours } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Subject name is required' });
  }
  const newSubject = {
    id: subjects.length + 1,
    name,
    code,
    description,
    weeklyHours: weeklyHours || 0
  };
  subjects.push(newSubject);
  res.status(201).json(newSubject);
});

app.put('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, code, description, weeklyHours } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Subject name is required' });
  }
  
  const subjectIndex = subjects.findIndex(s => s.id === id);
  if (subjectIndex === -1) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  const updatedSubject = {
    id,
    name,
    code,
    description,
    weeklyHours: weeklyHours || 0
  };
  
  subjects[subjectIndex] = updatedSubject;
  res.json(updatedSubject);
});

app.delete('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const subjectIndex = subjects.findIndex(s => s.id === id);
  
  if (subjectIndex === -1) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  // Check if subject is used in timetable
  const isUsed = timetableEntries.some(entry => entry.subjectId === id);
  if (isUsed) {
    return res.status(400).json({ 
      message: 'Cannot delete subject as it is used in the timetable' 
    });
  }
  
  subjects.splice(subjectIndex, 1);
  res.status(204).send();
});

// Routes for teachers
app.get('/api/teachers', (req, res) => {
  res.json(teachers);
});

app.get('/api/teachers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const teacher = teachers.find(t => t.id === id);
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  res.json(teacher);
});

app.post('/api/teachers', (req, res) => {
  const { name, email, phone, specialization, maxWeeklyHours } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Teacher name is required' });
  }
  const newTeacher = {
    id: teachers.length + 1,
    name,
    email,
    phone,
    specialization,
    maxWeeklyHours: maxWeeklyHours || 0
  };
  teachers.push(newTeacher);
  res.status(201).json(newTeacher);
});

app.put('/api/teachers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, phone, specialization, maxWeeklyHours } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Teacher name is required' });
  }
  
  const teacherIndex = teachers.findIndex(t => t.id === id);
  if (teacherIndex === -1) {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  
  const updatedTeacher = {
    id,
    name,
    email,
    phone,
    specialization,
    maxWeeklyHours: maxWeeklyHours || 0
  };
  
  teachers[teacherIndex] = updatedTeacher;
  res.json(updatedTeacher);
});

app.delete('/api/teachers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const teacherIndex = teachers.findIndex(t => t.id === id);
  
  if (teacherIndex === -1) {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  
  // Check if teacher is used in timetable
  const isUsed = timetableEntries.some(entry => entry.teacherId === id);
  if (isUsed) {
    return res.status(400).json({ 
      message: 'Cannot delete teacher as they are assigned in the timetable' 
    });
  }
  
  teachers.splice(teacherIndex, 1);
  res.status(204).send();
});

// Routes for periods
app.get('/api/periods', (req, res) => {
  res.json(periods);
});

app.get('/api/periods/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const period = periods.find(p => p.id === id);
  if (!period) {
    return res.status(404).json({ message: 'Period not found' });
  }
  res.json(period);
});

app.post('/api/periods', (req, res) => {
  const { name, startTime, endTime, dayOfWeek } = req.body;
  if (!name || !startTime || !endTime) {
    return res.status(400).json({ message: 'Name, start time, and end time are required' });
  }
  const newPeriod = {
    id: periods.length + 1,
    name,
    startTime,
    endTime,
    dayOfWeek
  };
  periods.push(newPeriod);
  res.status(201).json(newPeriod);
});

app.put('/api/periods/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, startTime, endTime, dayOfWeek } = req.body;
  
  if (!name || !startTime || !endTime) {
    return res.status(400).json({ message: 'Name, start time, and end time are required' });
  }
  
  const periodIndex = periods.findIndex(p => p.id === id);
  if (periodIndex === -1) {
    return res.status(404).json({ message: 'Period not found' });
  }
  
  const updatedPeriod = {
    id,
    name,
    startTime,
    endTime,
    dayOfWeek
  };
  
  periods[periodIndex] = updatedPeriod;
  res.json(updatedPeriod);
});

app.delete('/api/periods/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const periodIndex = periods.findIndex(p => p.id === id);
  
  if (periodIndex === -1) {
    return res.status(404).json({ message: 'Period not found' });
  }
  
  // Check if period is used in timetable
  const isUsed = timetableEntries.some(entry => entry.periodId === id);
  if (isUsed) {
    return res.status(400).json({ 
      message: 'Cannot delete period as it is used in the timetable' 
    });
  }
  
  periods.splice(periodIndex, 1);
  res.status(204).send();
});

// Routes for timetable
app.get('/api/timetables', (req, res) => {
  const fullTimetable = timetableEntries.map(entry => {
    const classItem = classes.find(c => c.id === entry.classId);
    const subject = subjects.find(s => s.id === entry.subjectId);
    const teacher = teachers.find(t => t.id === entry.teacherId);
    const period = periods.find(p => p.id === entry.periodId);
    
    return {
      id: entry.id,
      class: classItem,
      subject,
      teacher,
      period,
      dayOfWeek: entry.dayOfWeek
    };
  });
  
  res.json(fullTimetable);
});

app.get('/api/timetables/class/:classId', (req, res) => {
  const classId = parseInt(req.params.classId);
  const classTimetable = timetableEntries
    .filter(entry => entry.classId === classId)
    .map(entry => {
      const classItem = classes.find(c => c.id === entry.classId);
      const subject = subjects.find(s => s.id === entry.subjectId);
      const teacher = teachers.find(t => t.id === entry.teacherId);
      const period = periods.find(p => p.id === entry.periodId);
      
      return {
        id: entry.id,
        class: classItem,
        subject,
        teacher,
        period,
        dayOfWeek: entry.dayOfWeek
      };
    });
  
  res.json(classTimetable);
});

app.get('/api/timetables/teacher/:teacherId', (req, res) => {
  const teacherId = parseInt(req.params.teacherId);
  const teacherTimetable = timetableEntries
    .filter(entry => entry.teacherId === teacherId)
    .map(entry => {
      const classItem = classes.find(c => c.id === entry.classId);
      const subject = subjects.find(s => s.id === entry.subjectId);
      const teacher = teachers.find(t => t.id === entry.teacherId);
      const period = periods.find(p => p.id === entry.periodId);
      
      return {
        id: entry.id,
        class: classItem,
        subject,
        teacher,
        period,
        dayOfWeek: entry.dayOfWeek
      };
    });
  
  res.json(teacherTimetable);
});

app.get('/api/timetables/class/:classId/schedule', (req, res) => {
  const classId = parseInt(req.params.classId);
  const classItem = classes.find(c => c.id === classId);
  
  if (!classItem) {
    return res.status(404).json({ message: 'Class not found' });
  }
  
  const classTimetable = timetableEntries
    .filter(entry => entry.classId === classId)
    .map(entry => {
      const subject = subjects.find(s => s.id === entry.subjectId);
      const teacher = teachers.find(t => t.id === entry.teacherId);
      const period = periods.find(p => p.id === entry.periodId);
      
      return {
        id: entry.id,
        class: classItem,
        subject,
        teacher,
        period,
        dayOfWeek: entry.dayOfWeek
      };
    });
  
  const schedule = {
    className: classItem.name,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    periods: periods.map(p => p.name),
    data: []
  };
  
  for (let day = 1; day <= 7; day++) {
    const daySchedule = {
      day: schedule.days[day - 1],
      slots: []
    };
    
    for (const period of periods) {
      const entry = classTimetable.find(t => t.dayOfWeek === day && t.period.id === period.id);
      
      if (entry) {
        daySchedule.slots.push({
          periodId: period.id,
          periodName: period.name,
          subject: entry.subject.name,
          teacher: entry.teacher.name
        });
      } else {
        daySchedule.slots.push({
          periodId: period.id,
          periodName: period.name,
          subject: null,
          teacher: null
        });
      }
    }
    
    schedule.data.push(daySchedule);
  }
  
  res.json(schedule);
});

app.get('/api/timetables/teacher/:teacherId/schedule', (req, res) => {
  const teacherId = parseInt(req.params.teacherId);
  const teacher = teachers.find(t => t.id === teacherId);
  
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  
  const teacherTimetable = timetableEntries
    .filter(entry => entry.teacherId === teacherId)
    .map(entry => {
      const classItem = classes.find(c => c.id === entry.classId);
      const subject = subjects.find(s => s.id === entry.subjectId);
      const period = periods.find(p => p.id === entry.periodId);
      
      return {
        id: entry.id,
        class: classItem,
        subject,
        teacher,
        period,
        dayOfWeek: entry.dayOfWeek
      };
    });
  
  const schedule = {
    teacherName: teacher.name,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    periods: periods.map(p => p.name),
    data: []
  };
  
  for (let day = 1; day <= 7; day++) {
    const daySchedule = {
      day: schedule.days[day - 1],
      slots: []
    };
    
    for (const period of periods) {
      const entry = teacherTimetable.find(t => t.dayOfWeek === day && t.period.id === period.id);
      
      if (entry) {
        daySchedule.slots.push({
          periodId: period.id,
          periodName: period.name,
          class: entry.class.name,
          subject: entry.subject.name
        });
      } else {
        daySchedule.slots.push({
          periodId: period.id,
          periodName: period.name,
          class: null,
          subject: null
        });
      }
    }
    
    schedule.data.push(daySchedule);
  }
  
  res.json(schedule);
});

app.post('/api/timetables', (req, res) => {
  const { classId, subjectId, teacherId, periodId, dayOfWeek } = req.body;
  
  if (!classId || !subjectId || !teacherId || !periodId || dayOfWeek === undefined) {
    return res.status(400).json({ 
      message: 'Class ID, Subject ID, Teacher ID, Period ID, and Day of Week are required' 
    });
  }
  
  // Check if all entities exist
  const classItem = classes.find(c => c.id === classId);
  const subject = subjects.find(s => s.id === subjectId);
  const teacher = teachers.find(t => t.id === teacherId);
  const period = periods.find(p => p.id === periodId);
  
  if (!classItem || !subject || !teacher || !period) {
    return res.status(404).json({ message: 'One or more related entities not found' });
  }
  
  // Check for conflicts
  const existingEntry = timetableEntries.find(
    t => t.classId === classId && t.periodId === periodId && t.dayOfWeek === dayOfWeek
  );
  
  if (existingEntry) {
    return res.status(409).json({ 
      message: 'A timetable entry already exists for this class, period, and day' 
    });
  }
  
  // Check for teacher conflicts
  const teacherConflict = timetableEntries.find(
    t => t.teacherId === teacherId && t.periodId === periodId && t.dayOfWeek === dayOfWeek
  );
  
  if (teacherConflict) {
    return res.status(409).json({ 
      message: 'Teacher is already assigned to another class during this period and day' 
    });
  }
  
  const newTimetableEntry = {
    id: timetableEntries.length + 1,
    classId,
    subjectId,
    teacherId,
    periodId,
    dayOfWeek
  };
  
  timetableEntries.push(newTimetableEntry);
  
  // Return with full object
  const fullEntry = {
    id: newTimetableEntry.id,
    class: classItem,
    subject,
    teacher,
    period,
    dayOfWeek
  };
  
  res.status(201).json(fullEntry);
});

app.put('/api/timetables/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { classId, subjectId, teacherId, periodId, dayOfWeek } = req.body;
  
  if (!classId || !subjectId || !teacherId || !periodId || dayOfWeek === undefined) {
    return res.status(400).json({ 
      message: 'Class ID, Subject ID, Teacher ID, Period ID, and Day of Week are required' 
    });
  }
  
  // Check if timetable entry exists
  const entryIndex = timetableEntries.findIndex(t => t.id === id);
  if (entryIndex === -1) {
    return res.status(404).json({ message: 'Timetable entry not found' });
  }
  
  // Check if all entities exist
  const classItem = classes.find(c => c.id === classId);
  const subject = subjects.find(s => s.id === subjectId);
  const teacher = teachers.find(t => t.id === teacherId);
  const period = periods.find(p => p.id === periodId);
  
  if (!classItem || !subject || !teacher || !period) {
    return res.status(404).json({ message: 'One or more related entities not found' });
  }
  
  // Check for conflicts (excluding the current entry)
  const existingEntry = timetableEntries.find(
    t => t.id !== id && t.classId === classId && t.periodId === periodId && t.dayOfWeek === dayOfWeek
  );
  
  if (existingEntry) {
    return res.status(409).json({ 
      message: 'A timetable entry already exists for this class, period, and day' 
    });
  }
  
  // Check for teacher conflicts (excluding the current entry)
  const teacherConflict = timetableEntries.find(
    t => t.id !== id && t.teacherId === teacherId && t.periodId === periodId && t.dayOfWeek === dayOfWeek
  );
  
  if (teacherConflict) {
    return res.status(409).json({ 
      message: 'Teacher is already assigned to another class during this period and day' 
    });
  }
  
  const updatedEntry = {
    id,
    classId,
    subjectId,
    teacherId,
    periodId,
    dayOfWeek
  };
  
  timetableEntries[entryIndex] = updatedEntry;
  
  // Return with full object
  const fullEntry = {
    id,
    class: classItem,
    subject,
    teacher,
    period,
    dayOfWeek
  };
  
  res.json(fullEntry);
});

app.delete('/api/timetables/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const entryIndex = timetableEntries.findIndex(t => t.id === id);
  
  if (entryIndex === -1) {
    return res.status(404).json({ message: 'Timetable entry not found' });
  }
  
  timetableEntries.splice(entryIndex, 1);
  res.status(204).send();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
