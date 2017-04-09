var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();
var promise = require('bluebird');

app.use(express.static('public'));

var usernames = {};
var socket_rooms = { 'default': {} };
var room_list = ['default'];

var db_filename = "sqlite_db";
var db = new sqlite3.Database(db_filename);

function new_room() {
    this.black = 'open';
    this.white = 'open';
    this.move_num = 0;

    var this_ref = this;
    db.run("INSERT INTO main_table (BLACK, WHITE) " +
        "VALUES ('open', 'open')",
    function (err) {
        if (err) throw err;
        this_ref.db_id = this.lastID;
        console.log('created new room',this.lastID);
    });

    this.set_setup = function () {};
    this.get_setup = function () {};
    this.set_state = function (move_num, serialized_state) {
        db.run("INSERT INTO state_table (ID,MOVE,STATE) " +
            "VALUES (?,?,?)",
            [this.db_id, move_num, serialized_state],
            function (err) { if (err) throw err; });
    };
    this.get_state = function (move_num, callback) {
        db.get(
            "SELECT STATE FROM state_table " +
            "WHERE ID = ? AND MOVE = ?",
            [this.db_id, move_num],
            function (err, row) {
                if (err) throw err;
                callback(row.STATE);
            }
        );
    };
}

db.run(
    "CREATE TABLE IF NOT EXISTS 'main_table' (" +
    "ID INTEGER PRIMARY KEY AUTOINCREMENT," +
    "BLACK varchar," +
    "WHITE varchar)", function (err) { if (err) throw err; });
db.run(
    "CREATE TABLE IF NOT EXISTS 'state_table' (" +
    "ID int NOT NULL," +
    "MOVE int NOT NULL," +
    "STATE varchar," +
    "PRIMARY KEY (ID, MOVE))", function (err) { if (err) throw err; });

app.get('*', function(req, res) {
    console.log('someone noticed!');

    res.redirect('/test.html');
});

io.on('connection', function(socket){
    console.log('registered connection');

    socket.on('add user', function(username) {
        if (usernames.hasOwnProperty(username)) {
            socket.emit('username taken');
        } else {
            console.log('registering user:', username);

            socket.join('default');

            usernames[username] = username;
            socket.username = username;
            socket.room = 'default';

            socket.broadcast.to('default').emit('joined', username);
            socket.emit('success', 'registered as ' + username);
        }
    });

    socket.on('join room', function(room) {
        if (typeof room !== 'string') return;

        socket.leave(socket.room);
        socket.broadcast.to(socket.room).emit('left', socket.username);

        if (socket_rooms.hasOwnProperty(room)) {
            socket.join(room);
            socket.broadcast.to(room).emit('joined', socket.username);
            socket.room = room;
        } else {
            socket_rooms[room] = new new_room();
            room_list.push(room);
            socket.join(room);
            socket.room = room;
        }

        console.log(socket.username, 'joined room', socket.room);
        socket.emit('enter room',
            socket_rooms[socket.room].move_num,
            socket_rooms[socket.room].black,
            socket_rooms[socket.room].white);
    });

    socket.on('request room list', function () {
        console.log(JSON.stringify(room_list));
        socket.emit('success', JSON.stringify(room_list));
    });

    socket.on('take role', function(role) {
        if ( socket.room !== 'default') {
            var current_room = socket_rooms[socket.room];

            if (!current_room) {
                socket.emit('error to client', 'unexplained error...');
                return;
            }


            switch (role) {
                case 'spectate':
                    if (current_room.white === socket.username) {
                        current_room.white = 'open';
                        current_room.set_setup();
                        socket.emit('success', 'you are no longer white');
                        socket.broadcast.to(socket.room).emit('success', 'white is now open');
                    }
                    if (current_room.black === socket.username) {
                        current_room.black = 'open';
                        current_room.set_setup();
                        socket.emit('success', 'you are no longer black');
                        socket.broadcast.to(socket.room).emit('success', 'black is now open');
                    }
                    break;
                case 'black':
                    if (current_room.black === 'open') {
                        current_room.black = socket.username;
                        current_room.set_setup();
                        socket.emit('success', 'you are black');
                        socket.broadcast.to(socket.room).emit(
                            'success',
                            socket.username + ' is now black');
                    } else {
                        socket.emit('error to client', 'black occupied');
                    }
                    break;
                case 'white':
                    if (current_room.white === 'open') {
                        current_room.white = socket.username;
                        current_room.set_setup();
                        socket.emit('success', 'you are white');
                        socket.broadcast.to(socket.room).emit(
                            'success',
                            socket.username + ' is now white');
                    } else {
                        socket.emit('error to client', 'white occupied');
                    }
                    break;
            }

        } else {
            socket.emit('error to client', 'not in any room');
        }
    });

    socket.on('which room', function() {
        socket.emit('success', socket.room);
    });

    socket.on('disconnect', function() {
        console.log('registered disconnection of' , socket.username);

        var current_room = socket_rooms[socket.room];

        if (!current_room) {
            socket.emit('error to client', 'unexplained error...');
            return;
        }

        if (current_room.black === socket.username) {
            socket.broadcast.to(socket.room).emit('success', 'black is now open');
            current_room.black = 'open';
        }
        if (current_room.white === socket.username) {
            socket.broadcast.to(socket.room).emit('success', 'white is now open');
            current_room.white = 'open';
        }

        socket.leave(socket.room);
        socket.broadcast.to(socket.room).emit('left', socket.username);

        delete usernames[socket.username];
    });

    socket.on('request game state', function() {
        if ( socket.room !== 'default' ) {
            var current_room = socket_rooms[socket.room];
            if (current_room.move_num === 0) {
                socket.emit('reset state');
            } else {
                current_room.get_state(
                    current_room.move_num - 1,
                    function(serialized_state) {
                        socket.emit('game state update',
                            current_room.move_num - 1,
                            serialized_state
                        );
                    }
                );
            }
        } else {
            socket.emit('reset state');
        }
    });

    socket.on('game state change', function(move_num, serialized_state){
        if ( socket.room !== 'default' ) {
            var current_room = socket_rooms[socket.room];
            if ( current_room.move_num !== move_num ) {
                socket.emit('error to client',
                    'num_move differs, you: ' + move_num + ' server: ' + current_room.move_num);
                return;
            }
            if ((
                current_room.black === socket.username &&
                current_room.move_num % 2 === 0
            ) || (
                current_room.white === socket.username &&
                current_room.move_num % 2 === 1
            )) {
                current_room.set_state(move_num, serialized_state);
                current_room.move_num++;
                socket.broadcast.to(socket.room).emit(
                    'game state update',
                    move_num,
                    serialized_state);
                socket.emit(
                    'game state update',
                    move_num,
                    serialized_state);
            } else {
                socket.emit('error to client', 'failed to make move')
            }
        } else {
            socket.emit('error to client', 'not allowed to make move here')
        }
    });
});

http.listen(8000, function() {
    console.log("Server listening on port 8000")
});

process.on('SIGINT', function() {
    console.log('shutting down');
    db.close();
    http.close();
});