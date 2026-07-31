import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { ENV } from './env.js';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';

const app = express();
const server = http.createServer(app);

// Initialize Redis client connection
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error', err));

let redisConnected = false;
try {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  console.log("Connected to Redis for socket scaling");
  redisConnected = true;
} catch (error) {
  console.error("Failed to connect to Redis. Falling back to local in-memory pub-sub.", error);
}

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
  transports: ["websocket"],   // Force WebSocket transport directly
  pingInterval: 10000,         // Ping client every 10 seconds
  pingTimeout: 5000,           // Timeout in 5 seconds
  maxHttpBufferSize: 1000000,   // 1MB maximum frame size limit (Spam protect)
});

// Attach the Redis Adapter if connected
if (redisConnected) {
  io.adapter(createAdapter(pubClient, subClient));
}

//apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

const ONLINE_USERS_KEY = 'online_users';
const localUserSocketMap = {}; // Fallback in-memory map
const eventLimits = new Map(); // Local fallback tracker key: userId, val: { count, resetTime }

// Check if user is online or not
export async function getReciverSocketId(userId) {
  if (redisConnected) {
    return await pubClient.hGet(ONLINE_USERS_KEY, userId.toString());
  }
  return localUserSocketMap[userId.toString()];
}

export async function getAllOnlineUsers() {
  if (redisConnected) {
    return await pubClient.hKeys(ONLINE_USERS_KEY);
  }
  return Object.keys(localUserSocketMap);
}

async function isRateLimitExceeded(userId) {
  const limitPeriodMs = 5000; // 5 seconds window
  const maxEvents = 10;       // Max 10 events per window

  if (redisConnected) {
    const redisKey = `ratelimit:socket:${userId}`;
    const count = await pubClient.incr(redisKey);
    if (count === 1) {
      await pubClient.expire(redisKey, limitPeriodMs / 1000);
    }
    return count > maxEvents;
  } else {
    const now = Date.now();
    let limit = eventLimits.get(userId);

    if (!limit || now > limit.resetTime) {
      limit = { count: 1, resetTime: now + limitPeriodMs };
      eventLimits.set(userId, limit);
    } else {
      limit.count++;
    }
    return limit.count > maxEvents;
  }
}

io.on("connection", async (socket) => {
  try {
    const userId = socket.userId;
    console.log("a user connected", socket.user?.Fullname || "no-name", "Socket ID:", socket.id);

    if (redisConnected) {
      pubClient.hSet(ONLINE_USERS_KEY, userId, socket.id).catch((err) => {
        console.error("Failed to set online user in Redis:", err);
      });
    } else {
      localUserSocketMap[userId] = socket.id;
    }

    // Packet interceptor middleware for WebSocket event rate-limiting (spam control)
    socket.use((packet, next) => {
      const event = packet[0];
      if (event === "disconnect") return next();

      isRateLimitExceeded(userId)
        .then((exceeded) => {
          if (exceeded) {
            console.warn(`[Rate Limit Block] User ${socket.user?.Fullname || userId} blocked for event spam: ${event}`);
            socket.emit("rateLimitError", { message: "Too many events. Please slow down." });
          } else {
            next();
          }
        })
        .catch((err) => {
          console.error("Rate limit check error, bypassing limit:", err);
          next();
        });
    });

    const onlineUsers = await getAllOnlineUsers();
    io.emit("getOnlineUsers", onlineUsers);

    socket.on("disconnect", async () => {
      try {
        console.log("a user disconnected", socket.user?.Fullname || "no-name", "Socket ID:", socket.id);
        
        if (redisConnected) {
          await pubClient.hDel(ONLINE_USERS_KEY, userId);
        } else {
          delete localUserSocketMap[userId];
          eventLimits.delete(userId); // Prevent memory leaks
        }
        
        const onlineUsers = await getAllOnlineUsers();
        io.emit("getOnlineUsers", onlineUsers);
      } catch (err) {
        console.error("Error in socket disconnect handler:", err);
      }
    });
  } catch (err) {
    console.error("Error in socket connection handler:", err);
  }
});

export { server, io, app };



