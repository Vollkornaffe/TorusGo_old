function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.y = 0;
    camera.position.x = 0;
    camera.position.z =
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x0097bd );
    var light, object;
    scene.add( new THREE.AmbientLight( 0x404040 ) );
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );
    //
    object = new THREE.AxisHelper( 50 );
    object.position.set( 0, 0, 0 );
    scene.add( object );
    //
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    stats = new Stats();
    container.appendChild( stats.dom );
    //
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false);
    document.addEventListener( 'mousedown', onDocumentMouseDown, false);
    document.addEventListener( 'keydown', onDocumentKeyDown, false);
    document.addEventListener( 'keyup', onDocumentKeyUp, false);

    custom_init();
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}