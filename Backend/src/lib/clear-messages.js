import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function clearMessages() {
  const MONGODB_URL = process.env.MONGODB_URL;
  if (!MONGODB_URL) {
    console.error("MONGODB_URL is missing in your .env file!");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("DB connected successfully!");
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }

  try {
    // Access the messages collection directly
    const messagesCollection = mongoose.connection.collection("messages");
    
    // Count current messages
    const countBefore = await messagesCollection.countDocuments();
    console.log(`\nFound ${countBefore} messages in the database.`);

    if (countBefore === 0) {
      console.log("Database is already clean. No messages to delete.");
    } else {
      console.log("Deleting all messages...");
      const result = await messagesCollection.deleteMany({});
      console.log(`🎉 SUCCESS! Deleted ${result.deletedCount} messages from the collection.`);
    }
  } catch (err) {
    console.error("Error clearing messages:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("DB disconnected.");
  }
}

clearMessages();
