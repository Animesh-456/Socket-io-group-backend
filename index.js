import http from 'http';
import { Server } from 'socket.io';
import { Stream } from 'stream';

// Create an HTTP server
const server = http.createServer();

// Create a new instance of Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

// Listen for incoming connections
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
        console.log("message received", data)
    });



    socket.on('call-user', (data) => {
        socket.to(data.socketId).emit('incoming-call', { from: socket.id, offer: data.offer });
    });


    socket.on("call-accepted", (data) => {
        //console.log("socket id for accept call", socket.id)
        socket.to(data.socketId).emit("call-accepted", { answer: data.answer })
        console.log("call accepted", data.answer)
    })

    // socket.on('answer', (targetId, answer) => {
    //     socket.to(targetId).emit('answer', socket.id, answer);
    // });

    // socket.on('iceCandidate', (targetI, candidate) => {
    //     io.to(targetId).emit('iceCandidate', socket.id, candidate);
    // });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
