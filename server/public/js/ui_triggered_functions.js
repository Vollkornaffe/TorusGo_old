function UI_functions() {
    this.handle_chat_input = function () {
        var chat_input = document.getElementById('chat-input');
        var msg = chat_input.value;
        server_comm_instance.send_msg(msg);
        chat_input.value = '';
    };

    this.add_msg = function (data) {
        var e = document.getElementById('messages_ul');
        var new_li = document.createElement('li');
        new_li.innerHTML = data.msg;
        new_li.setAttribute('type', 'square');
        e.insertBefore(new_li, e.firstChild);
        switch (data.type) {
            case 'chat':
                new_li.setAttribute('style','color: white;');
                break;
            case 'info':
                new_li.setAttribute('style','color: black;');
                break;
            case 'error':
                new_li.setAttribute('style','color: red;');
                break;
            default:
                alert('msg type not known');
        }
    };

    return this;
}