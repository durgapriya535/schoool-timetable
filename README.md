# School Timetable Management System

A comprehensive application for managing school timetables, class schedules, and teacher assignments.

## Features

- **Class Management**: Add, edit, and delete classes
- **Teacher Management**: Manage teacher information and specializations
- **Subject Management**: Organize subjects with weekly hour allocations
- **Period Management**: Configure time slots for the school day
- **Timetable Creation**: Create and manage timetable entries with conflict detection
- **Schedule Views**:
  - Class-wise schedule view
  - Teacher-wise schedule view
  - Weekday-wise schedule view
- **Analytics**: Visualize subject distribution and other metrics
- **Conflict Detection**: Prevents scheduling conflicts such as:
  - Teachers being assigned to multiple classes at the same time
  - Classes having multiple subjects at the same time

## Technology Stack

- **Frontend**: React, Material-UI, Chart.js
- **Backend**: Node.js, Express, TypeORM
- **Database**: MySQL

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure the database in `server/src/config/database.ts`
4. Start the development servers:

```bash
# Start the backend server
cd server
npm run dev

# Start the frontend server
cd ../client
npm start
```

## Usage

1. First, set up classes, teachers, subjects, and periods
2. Create timetable entries by assigning teachers to classes for specific subjects and periods
3. View and manage schedules through the different views available

## Recent Updates

- Added weekday-wise timetable view
- Implemented teacher conflict detection to prevent scheduling conflicts
- Enhanced error handling with detailed conflict information
- Improved subject distribution visualization
