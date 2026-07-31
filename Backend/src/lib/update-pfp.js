import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model.js";

dotenv.config();

const pfpMap = {
  "sumit@livechat.com": "https://ui-avatars.com/api/?name=Sumit+Kamti&background=0d8abc&color=fff&size=128",
  "sarah@livechat.com": "https://ui-avatars.com/api/?name=Sarah+Connor&background=20b2aa&color=fff&size=128",
  "bruce@livechat.com": "https://ui-avatars.com/api/?name=Bruce+Wayne&background=343a40&color=fff&size=128",
  "clark@livechat.com": "https://ui-avatars.com/api/?name=Clark+Kent&background=007bff&color=fff&size=128",
  "diana@livechat.com": "https://ui-avatars.com/api/?name=Diana+Prince&background=dc3545&color=fff&size=128"
};

async function run() {
  const MONGODB_URL = process.env.MONGODB_URL;
  if (!MONGODB_URL) {
    console.error("MONGODB_URL missing!");
    process.exit(1);
  }

  console.log("Connecting to DB...");
  await mongoose.connect(MONGODB_URL);

  console.log("Updating profile pictures...");
  for (const [email, pfpUrl] of Object.entries(pfpMap)) {
    const result = await User.updateOne(
      { Email: email },
      { $set: { profilePic: pfpUrl } }
    );
    console.log(`Updated PFP for ${email}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
  }

  // Also clean up any users with empty/broken avatars to fallback to "/avatar.png"
  const defaultPfpUsers = await User.updateMany(
    { profilePic: { $regex: /iran\.liara\.run/ } },
    { $set: { profilePic: "" } }
  );
  console.log(`Cleaned up broken avatars: modified ${defaultPfpUsers.modifiedCount}`);

  await mongoose.disconnect();
  console.log("Done!");
}

run();
