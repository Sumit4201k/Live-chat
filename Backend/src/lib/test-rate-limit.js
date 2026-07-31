import { io } from "socket.io-client";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "jetdcebry";
const MONGODB_URL = process.env.MONGODB_URL;

async function run() {
  console.log("Connecting to MongoDB to fetch a valid test user...");
  try {
    await mongoose.connect(MONGODB_URL);
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }

  // Fetch first user
  const User = mongoose.model("User", new mongoose.Schema({}));
  const user = await User.findOne();
  if (!user) {
    console.error("No users found in database. Please sign up a user in the app first before testing!");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Found test user: ${user._id}. Creating JWT...`);
  const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "1h" });
  await mongoose.disconnect();

  console.log("Connecting to WebSocket server...");
  const socket = io("http://localhost:3000", {
    extraHeaders: {
      Cookie: `jwt=${token}`
    },
    transports: ["websocket"]
  });

  let rateLimitWarningReceived = false;

  socket.on("connect", () => {
    console.log("Socket connected! Commencing spam test (sending 15 messages in 50ms)...");
    
    // Send 15 typing events within 50ms (Limit is 10 per 5 seconds)
    for (let i = 1; i <= 15; i++) {
      socket.emit("newMessage", { text: `Spam packet #${i}`, receiverId: "60df00000000000000000000" });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected on client. Reason: ${reason}`);
  });

  socket.on("rateLimitError", (data) => {
    rateLimitWarningReceived = true;
    console.log(`\n🎉 Success! Received Rate Limit warning from server: "${data.message}"`);
  });

  socket.on("connect_error", (err) => {
    console.error("Handshake error:", err.message);
    process.exit(1);
  });

  // Give the server 3 seconds to respond, then exit and report
  setTimeout(() => {
    socket.disconnect();
    if (rateLimitWarningReceived) {
      console.log("\n==========================================");
      console.log("STATUS: PASS - Rate limiter is active and functioning.");
      console.log("==========================================\n");
      process.exit(0);
    } else {
      console.log("\n==========================================");
      console.log("STATUS: FAIL - Did not receive any rate limit warnings.");
      console.log("==========================================\n");
      process.exit(1);
    }
  }, 3000);
}

run();
