var socket = io();

socket.on('connect', register);

socket.on('username taken', function () {
    console.log('username is occupied');
    register();
});

socket.on('game state update', function(move_num, serialized_state) {
    console.log('server sends you move: ', move_num);
    game_logic_instance.update_from_server(move_num, serialized_state);
});

socket.on('joined', function(username) {
    console.log(username, 'joined your room');
});

socket.on('left', function(username) {
    console.log(username, 'left your room');
});

socket.on('error to client', function(err_msg) {
    console.log(err_msg);
});

socket.on('reset state', function() {
    alert('new game');
    game_logic_instance.reset();
});

socket.on('enter room', function(move_num, black_player, white_player) {
    socket.emit('request game state');
});

socket.on('success', function(suc_msg) {
    if (suc_msg === 'you are black') {
        if (game_role === 'white') {
            game_role = 'both';
            console.log('full control');
            return;
        }
        game_role = 'black';
    }
    if (suc_msg === 'you are white') {
        if (game_role === 'black') {
            game_role = 'both';
            console.log('full control');
            return;
        }
        game_role = 'white';
    }
    console.log(suc_msg);
});

function register() {
    var username = prompt('Give a username');
    socket.emit('add user', username);
}

function join_room(room) {
    socket.emit('join room', room);
}

function send_game_state(move_num, serialized_state) {
    socket.emit('game state change', move_num, serialized_state);
}

function which_room() {
    socket.emit('which room');
}

function room_list() {
    socket.emit('request room list');
}

function play_as(role) {
    socket.emit('take role', role);
}
