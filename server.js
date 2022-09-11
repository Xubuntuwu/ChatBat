const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// ChatBat Botname:
const botName = 'ChatBat Bot';

// on client connection:
io.on('connection', (socket)=>{
    // socket.emit: emits to the single connecting user
    // sockket.broadcast.emit: broadcasts to everyone except that user
    // io.emit: broadcasts to everybody
    // console.log('New Websocket Connection');

    // on joinRoom from client
    socket.on('joinRoom', ({username, room})=>{
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // welcomes current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatBat!'));

        // broadcast when a client connects 
        socket.broadcast
        .to(user.room)
        .emit(
            'message', 
            formatMessage(botName,`${user.username} has joined the chat`)
        );

        // send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });


    // listen for new message in chat
    socket.on('chatMessage', (msg)=>{
        const user = getCurrentUser(socket.id);
        
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    // when client disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
            
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    })
})


const PORT = process.env.PORT || 3000;

server.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})