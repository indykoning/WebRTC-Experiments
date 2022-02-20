var express = require('express');
var app = express();
var server = require('http').Server(app).listen(3000);
var io = require('socket.io')(server);

var messages = [];

function broadcastToRoom(socket, topic, message) {
    rooms = socket.rooms.filter(roomName => roomName.includes('room-'));
    for (const room in rooms) {
        io.to(room).emit(topic, message);
    }
}

io.on('connection', (socket)=>{
    console.log('socket emerged');

    socket.on('join', (data) => {
        socket.join('room-' + data.roomNr);

        io.to('room-' + data.roomNr).emit('joined', socket.id);
    });

    socket.on("offer", (id, message) => {
        socket.to(id).emit("offer", socket.id, message);
    });
    socket.on("answer", (id, message) => {
        socket.to(id).emit("answer", socket.id, message);
    });
    socket.on("candidate", (id, message) => {
        socket.to(id).emit("candidate", socket.id, message);
    });
});
