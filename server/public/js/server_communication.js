function Custom_socket_io() {
    var socket = io();

    socket.on('connect', this.register);

    socket.on('username taken', function () {
        console.log('username is occupied');
        this.register();
    });

    socket.on('game state update', function (move_num, serialized_state) {
        console.log('server sends you move: ', move_num);
        game_logic_instance.update_from_server(move_num, serialized_state);
    });

    socket.on('joined', function (username) {
        console.log(username, 'joined your room');
    });

    socket.on('left', function (username) {
        console.log(username, 'left your room');
    });

    socket.on('error to client', function (err_msg) {
        console.log(err_msg);
    });

    socket.on('reset state', function () {
        alert('new game');
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

    this.register = function () {
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

    this.socket_instance = socket;

    return this;
}
