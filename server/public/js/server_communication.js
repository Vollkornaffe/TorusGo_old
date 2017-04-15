function Custom_socket_io(ui_functions) {
    register = function () {
        var username = prompt('Give a username');
        socket.emit('add user', username);
    };

    this.join_room = function (room) {
        socket.emit('join room', room);
    };

    this.send_game_state = function (move_num, serialized_state) {
        socket.emit('game state change', move_num, serialized_state);
    };

    this.which_room = function () {
        socket.emit('which room');
    };

    this.room_list = function () {
        socket.emit('request room list');
    };

    this.play_as = function (role) {
        socket.emit('take role', role);
    };

    this.send_msg = function (msg) {
        socket.emit('chat', msg);
    };

    var socket = io();

    socket.on('connect', register);

    socket.on('username taken', function () {
        ui_functions.add_msg({type: 'error', msg: 'username is occupied'});
        console.log(this.id);
        register();
    });

    socket.on('game state update', function (move_num, serialized_state) {
        console.log('server sends you move: ', move_num);
        game_logic_instance.update_from_server(move_num, serialized_state);
    });

    socket.on('joined', function (username) {
        ui_functions.add_msg({type: 'info', msg: username + ' joined your room!'});
    });

    socket.on('left', function (username) {
        ui_functions.add_msg({type: 'info', msg: username + ' left your room!'});
    });

    socket.on('error to client', function (err_msg) {
        ui_functions.add_msg({type: 'error', msg: err_msg});
    });

    socket.on('reset state', function () {
        ui_functions.add_msg({type: 'info', msg: 'new game!'});
        game_logic_instance.reset();
        current_player = -1;
    });

    socket.on('enter room', function (move_num, black_player, white_player) {
        socket.emit('request game state');
    });

    socket.on('success', function (suc_msg) {
        if (suc_msg === 'you are black') {
            if (game_role === 'white') {
                game_role = 'both';
                ui_functions.add_msg({type: 'info', msg: 'you have full control over the game'});
                return;
            }
            game_role = 'black';
        }
        if (suc_msg === 'you are white') {
            if (game_role === 'black') {
                game_role = 'both';
                ui_functions.add_msg({type: 'info', msg: 'you have full control over the game'});
                return;
            }
            game_role = 'white';
        }
        ui_functions.add_msg({type: 'info', msg: suc_msg});
    });

    socket.on('chat update', function(sender_of_msg, msg) {
        console.log(sender_of_msg, msg);
        ui_functions.add_msg({type: 'chat', msg: sender_of_msg + ": " + msg});
    });

    this.socket_instance = socket;

    return this;
}
