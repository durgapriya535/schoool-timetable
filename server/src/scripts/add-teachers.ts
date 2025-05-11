import { AppDataSource } from "../config/database";
import { Teacher } from "../models/Teacher";

async function addTeachers() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log("Database connection established");
    
    const teacherRepository = AppDataSource.getRepository(Teacher);
    
    // List of teachers to add
    const teacherNames = [
      "Manisha",
      "Anitha",
      "Pushpa",
      "Venky",
      "Sravani",
      "Aruna",
      "Surekha",
      "Radhika",
      "Vani",
      "Ramanamma",
      "Vasundahra",
      "Venkateswaramma",
      "Santi",
      "Usha",
      "Nafeeza"
    ];
    
    // Create teacher objects
    const teachersToAdd = [];
    
    for (const name of teacherNames) {
      // Check if teacher already exists
      const existingTeacher = await teacherRepository.findOne({ where: { name } });
      
      if (!existingTeacher) {
        const newTeacher = new Teacher();
        newTeacher.name = name;
        newTeacher.phone = "";
        newTeacher.specialization = "";
        newTeacher.maxWeeklyHours = 30; // Default max weekly hours
        
        teachersToAdd.push(newTeacher);
      } else {
        console.log(`Teacher ${name} already exists, skipping...`);
      }
    }
    
    // Save all teachers
    if (teachersToAdd.length > 0) {
      await teacherRepository.save(teachersToAdd);
      console.log(`Added ${teachersToAdd.length} new teachers to the database.`);
    } else {
      console.log("No new teachers to add.");
    }
    
    // List all teachers
    const allTeachers = await teacherRepository.find();
    console.log("All teachers in the database:");
    allTeachers.forEach(t => {
      console.log(`ID: ${t.id}, Name: ${t.name}, Specialization: ${t.specialization || 'None'}`);
    });
    
  } catch (error) {
    console.error("Error adding teachers:", error);
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  }
}

// Run the function
addTeachers();
