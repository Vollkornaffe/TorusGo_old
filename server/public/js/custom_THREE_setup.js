function custom_init() {
    torus_instance = new torus(10, 3, 13, 13);
    scene.add(torus_instance.mesh);
    torus_instance.w_lines.map(function(item) { scene.add(item) });
    torus_instance.h_lines.map(function(item) { scene.add(item) });

    camera.position.x = Math.cos(cameraSettings.rho) * Math.cos(cameraSettings.phi) * cameraSettings.rad;
    camera.position.z = Math.cos(cameraSettings.rho) * Math.sin(cameraSettings.phi) * cameraSettings.rad;
    camera.position.y = Math.sin(cameraSettings.rho) * cameraSettings.rad;
}
function onDocumentMouseDown( event ) {
}

function onDocumentKeyDown( event ) {
    switch(event.keyCode) {
        case 17:
            mouseMode = "camera";
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