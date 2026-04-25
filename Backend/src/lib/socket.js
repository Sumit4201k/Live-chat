import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { ENV } from './env.js';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';


const app = express();
const server = http.createServer(app);

const io = new Server(server , {
    cors:{
        origin:[ENV.CLIENT_URL],
        credentials:true,
    }
});

//apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);


//this is for storing online users  
const userSocketMap = {};  //{userId:socketid}

io.on("connection" , (socket) =>{
    console.log("a user connected" , socket.user.Fullname);

    const userId = socket.userId;
    userSocketMap[userId]=socket.id

    //io.emit() is used to send events to all connected clients
    
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    
    //with socket.on() we listen to event from clients
    socket.on("disconnect",()=>{
        console.log("a user disconnected", socket.user.Fullname);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
    
});   

export { server, io, app }


