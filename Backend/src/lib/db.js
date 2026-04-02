import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async() => {

    const MOGODB= ENV.MONGODB_URL
    if (!MOGODB) {
        console.log("MONGO DB URL ERROR ");
        
    }
    try {
        const conn = await mongoose.connect(ENV.MONGODB_URL)
        console.log("DB CONNECTED :",conn.connection.host);
        console.log("DB NAME :",conn.connection.name);
        
    } catch (error) {
      console.error("DATABASE NOT CONNECTED",error);
      process.exit(1); //app gonna run even if data base errror detected
        
    }
}

/*

Self note: When connecting to MongoDB, you might see a connection string like this:
 2. ?retryWrites=true

 This means:
 If a write operation fails (like insert/update)
MongoDB will automatically retry it

 Example:

Network glitch happens while saving message
MongoDB retries → avoids data loss

✔ Improves reliability
✔ Default in Atlas (you should keep it)

 3. &w=majority
 This is about write safety

w = write concern
majority = data is saved only when most servers confirm it

 Example:

Your cluster has 3 nodes
At least 2 must confirm the write

✔ Ensures data is safely stored
✔ Prevents data loss in crashes */