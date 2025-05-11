import { AppDataSource } from "../config/database";

async function updateTeacherSchema() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log("Database connection established");
    
    // Drop the unique constraint on email first (if it exists)
    try {
      await AppDataSource.query(`ALTER TABLE teacher DROP INDEX IDX_00634394dce7677d531749ed8e`);
      console.log("Dropped unique constraint on email field");
    } catch (error) {
      console.log("No unique constraint found or already dropped");
    }
    
    // Drop the email column
    try {
      await AppDataSource.query(`ALTER TABLE teacher DROP COLUMN email`);
      console.log("Dropped email column from teacher table");
    } catch (error) {
      console.log("Email column not found or already dropped");
    }
    
    console.log("Teacher schema updated successfully");
    
  } catch (error) {
    console.error("Error updating teacher schema:", error);
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  }
}

// Run the function
updateTeacherSchema();
