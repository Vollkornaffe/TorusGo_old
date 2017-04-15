function custom_init_threejs() {
    torus_instance = new Torus(20, 10, 10, 10);
    scene.add(torus_instance.mesh);
    torus_instance.w_lines.map(function(item) { scene.add(item) });
    torus_instance.h_lines.map(function(item) { scene.add(item) });

    camera.position.x = Math.cos(cameraSettings.rho) * Math.cos(cameraSettings.phi) * cameraSettings.rad;
    camera.position.z = Math.cos(cameraSettings.rho) * Math.sin(cameraSettings.phi) * cameraSettings.rad;
    camera.position.y = Math.sin(cameraSettings.rho) * cameraSettings.rad;

    selection_stone = new THREE.Mesh(
        new THREE.SphereGeometry( 0.5, 10, 10 ),
        new THREE.MeshPhongMaterial( { color: 0x33cc33 } ));
    scene.add( selection_stone );
}

function onDocumentMouseDown( event ) {
    if (game_role === 'spectator') return;
    if (game_role !== 'both' && game_role === 'black' && current_player !== -1) return;
    if (game_role !== 'both' && game_role === 'white' && current_player !== 1) return;

    if (game_logic_instance.make_move()) {
        var move_num = game_logic_instance.move_num-1;
        var serialized_state = JSON.stringify(
            game_logic_instance.positions.map(function(pos) {
                return {'pos': pos.pos, 'status': pos.status };
            })
        );

        server_comm_instance.send_game_state(move_num, serialized_state);
    }
}

function onDocumentKeyDown( event ) {
    switch(event.keyCode) {
        case 17:
            mouseMode = "camera";
            break;
        case 37:
            event.preventDefault();
            torus_instance.params.twist -= 0.05;
            break;
        case 38:
            event.preventDefault();
            if (cameraSettings.rad >= 1)
                cameraSettings.rad -= 1;
            break;
        case 39:
            event.preventDefault();
            torus_instance.params.twist += 0.05;
            break;
        case 40:
            event.preventDefault();
            if (cameraSettings.rad <= 999)
                cameraSettings.rad += 1;
            break;
    }
}

function onDocumentKeyUp( event ) {
    switch(event.keyCode) {
        case 17:
            mouseMode = "select";
            break;
    }
}
