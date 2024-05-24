import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import serverless from 'serverless-http';

const app = express();
app.use(cors({
    origin: 'https://socket-io-group-frontend.vercel.app', // Replace with your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://socket-io-group-frontend.vercel.app', // Replace with your frontend URL
    },
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data.room);
        socket.to(data.room).emit("user_join", { user: data.user, socketId: socket.id });
        console.log(`User with ID: ${socket.id} joined the room: ${data}`);
    });

    socket.on("leave_room", (data) => {
        socket.leave(data.room);
        socket.to(data.room).emit("user_left", { user: data.user, socketId: socket.id });
        console.log(`User with ID: ${socket.id} left the room: ${data}`);
    });

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
        console.log("message received", data);
    });

    socket.on('call-user', (data) => {
        socket.to(data.socketId).emit('incoming-call', { from: socket.id, offer: data.offer });
    });

    socket.on("call-accepted", (data) => {
        socket.to(data.socketId).emit("call-accepted", { answer: data.answer });
        console.log("call accepted", data.answer);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});


app.get('/', (req, res) => {
    res.send('Socket.IO server running');
});

// Wrap the express app with serverless
module.exports.handler = serverless(app);
