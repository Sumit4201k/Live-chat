import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.model.js";

dotenv.config();

const dummyUsers = [
  {
    Fullname: "Sumit Kamti",
    Email: "sumit@livechat.com",
    profilePic: "https://avatar.iran.liara.run/public/15"
  },
  {
    Fullname: "Sarah Connor",
    Email: "sarah@livechat.com",
    profilePic: "https://avatar.iran.liara.run/public/65"
  },
  {
    Fullname: "Bruce Wayne",
    Email: "bruce@livechat.com",
    profilePic: "https://avatar.iran.liara.run/public/33"
  },
  {
    Fullname: "Clark Kent",
    Email: "clark@livechat.com",
    profilePic: "https://avatar.iran.liara.run/public/25"
  },
  {
    Fullname: "Diana Prince",
    Email: "diana@livechat.com",
    profilePic: "https://avatar.iran.liara.run/public/88"
  }
];

async function seed() {
  const MONGODB_URL = process.env.MONGODB_URL;
  if (!MONGODB_URL) {
    console.error("MONGODB_URL is missing in your Backend/.env file!");
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

  const defaultPassword = "password123";
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(defaultPassword, salt);

  console.log("\nSeeding dummy accounts...");
  for (const dummy of dummyUsers) {
    const existing = await User.findOne({ Email: dummy.Email });
    if (existing) {
      console.log(`- User already exists: ${dummy.Email} (${dummy.Fullname})`);
    } else {
      const newUser = new User({
        Fullname: dummy.Fullname,
        Email: dummy.Email.toLowerCase(),
        Password: hashedPassword,
        profilePic: dummy.profilePic
      });
      await newUser.save();
      console.log(`+ Successfully created user: ${dummy.Email} (${dummy.Fullname})`);
    }
  }

  console.log("\nDatabase seeding completed successfully!");
  await mongoose.disconnect();
  console.log("DB disconnected.");
}

seed();
