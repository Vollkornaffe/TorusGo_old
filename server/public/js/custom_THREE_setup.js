function custom_init() {
    torus_instance = new torus(10, 3, 100, 3);
    scene.add(torus_instance.mesh);
}