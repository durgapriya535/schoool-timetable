import { AppDataSource } from "../config/database";
import { Class } from "../models/Class";

async function addClasses() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log("Database connection established");
    
    const classRepository = AppDataSource.getRepository(Class);
    
    // Create classes for grades 1-5 with sections A1 and A2
    const classesToAdd = [];
    
    for (let grade = 1; grade <= 5; grade++) {
      const sections = ["A1", "A2"];
      
      for (const section of sections) {
        const className = `${grade} - ${section}`;
        
        // Check if class already exists
        const existingClass = await classRepository.findOne({ where: { name: className } });
        
        if (!existingClass) {
          const newClass = classRepository.create({
            name: className,
            grade: grade.toString(),
            section: section,
            description: `Grade ${grade}, Section ${section}`
          });
          
          classesToAdd.push(newClass);
        } else {
          console.log(`Class ${className} already exists, skipping...`);
        }
      }
    }
    
    // Save all classes
    if (classesToAdd.length > 0) {
      await classRepository.save(classesToAdd);
      console.log(`Added ${classesToAdd.length} new classes to the database.`);
    } else {
      console.log("No new classes to add.");
    }
    
    // List all classes
    const allClasses = await classRepository.find();
    console.log("All classes in the database:");
    allClasses.forEach(c => {
      console.log(`ID: ${c.id}, Name: ${c.name}, Grade: ${c.grade}, Section: ${c.section}`);
    });
    
  } catch (error) {
    console.error("Error adding classes:", error);
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  }
}

// Run the function
addClasses();
