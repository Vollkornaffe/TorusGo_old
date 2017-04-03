var socket = io();

socket.on('connect', function() {
    var username = prompt('Give a username');
    socket.emit('add user', username);
});

socket.on('game state change', function(serialized_state) {
    console.log('server says: ', serialized_state);
});

socket.on('joined', function(username) {
    console.log(username, ' joined your room');
});

socket.on('left', function(username) {
    console.log(username, ' left your room');
});

function join_room(room) {
    socket.emit('join room', room);
}

function send_game_state() {
    socket.emit('game state change', 'asdfasdf test');
}