import { AppDataSource } from "../config/database";
import { Period } from "../models/Period";

async function addPeriods() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log("Database connection established");
    
    const periodRepository = AppDataSource.getRepository(Period);
    
    // List of periods to add
    const periodsData = [
      { name: "Period 1", startTime: "09:00", endTime: "09:50" },
      { name: "Period 2", startTime: "09:50", endTime: "10:40" },
      { name: "Period 3", startTime: "10:50", endTime: "11:40" },
      { name: "Period 4", startTime: "11:40", endTime: "12:30" },
      { name: "Period 5", startTime: "13:20", endTime: "14:05" },
      { name: "Period 6", startTime: "14:05", endTime: "14:50" },
      { name: "Period 7", startTime: "15:00", endTime: "15:45" },
      { name: "Period 8", startTime: "15:45", endTime: "16:30" }
    ];
    
    // Create period objects
    const periodsToAdd = [];
    
    for (const periodData of periodsData) {
      // Check if period already exists
      const existingPeriod = await periodRepository.findOne({ 
        where: { 
          name: periodData.name,
          startTime: periodData.startTime,
          endTime: periodData.endTime
        } 
      });
      
      if (!existingPeriod) {
        const newPeriod = new Period();
        newPeriod.name = periodData.name;
        newPeriod.startTime = periodData.startTime;
        newPeriod.endTime = periodData.endTime;
        
        periodsToAdd.push(newPeriod);
      } else {
        console.log(`Period ${periodData.name} already exists, skipping...`);
      }
    }
    
    // Save all periods
    if (periodsToAdd.length > 0) {
      await periodRepository.save(periodsToAdd);
      console.log(`Added ${periodsToAdd.length} new periods to the database.`);
    } else {
      console.log("No new periods to add.");
    }
    
    // List all periods
    const allPeriods = await periodRepository.find();
    console.log("All periods in the database:");
    allPeriods.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}, Time: ${p.startTime} - ${p.endTime}`);
    });
    
  } catch (error) {
    console.error("Error adding periods:", error);
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  }
}

// Run the function
addPeriods();
