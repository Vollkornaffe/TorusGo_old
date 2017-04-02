function custom_init_threejs() {
    torus_instance = new torus(10, 3, 3, 3);
    scene.add(torus_instance.mesh);
    torus_instance.w_lines.map(function(item) { scene.add(item) });
    torus_instance.h_lines.map(function(item) { scene.add(item) });

    camera.position.x = Math.cos(cameraSettings.rho) * Math.cos(cameraSettings.phi) * cameraSettings.rad;
    camera.position.z = Math.cos(cameraSettings.rho) * Math.sin(cameraSettings.phi) * cameraSettings.rad;
    camera.position.y = Math.sin(cameraSettings.rho) * cameraSettings.rad;
}
function onDocumentMouseDown( event ) {
    game_logic_instance.make_move();
}

function onDocumentKeyDown( event ) {
    switch(event.keyCode) {
        case 17:
            mouseMode = "camera";
            break;
        case 38:
            event.preventDefault();
            if (cameraSettings.rad >= 1)
                cameraSettings.rad -= 1;
            break;
        case 40:
            event.preventDefault();
            if (cameraSettings.rad <= 99)
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
