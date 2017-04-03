var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

var usernames ={};
var socket_rooms_in_use = {
    'default': false,
    'room0': false,
    'room1': false
}

app.get('*', function(req, res) {
    res.redirect('/test.html');
});

io.on('connection', function(socket){
    console.log('registered connection');

    socket.on('add user', function(username) {
        console.log('registering user:', username);

        socket.join('default');

        usernames[username] = username;
        socket.username = username;
        socket.room = 'default';

        socket.broadcast.to('default').emit('joined', username);
    });

    socket.on('join room', function(room) {
        if (socket_rooms_in_use.hasOwnProperty(room)) {
            socket.leave(socket.room);
            socket.broadcast.to(socket.room).emit('left', socket.username);

            socket.join(room);
            socket.broadcast.to(socket.room).emit('joined', socket.username);

            socket.room = room;
        } else {
            socket.emit('room does not exist');
        }
    });

    socket.on('disconnect', function() {
        console.log('registered disconnection of' , socket.username);

        socket.leave(socket.room);
        socket.broadcast.to(socket.room).emit('left', socket.username);

        delete usernames[socket.username];
    });

    socket.on('game state change', function(serialized_state){
        console.log(socket.username, 'made a move in', socket.room);
        socket.broadcast.to(socket.room).emit('game state change', serialized_state);
    });
});

http.listen(8000, function() {
    console.log("Server listening on port 8000")
});
