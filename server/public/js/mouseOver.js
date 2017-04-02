function getSelectedPos(raycaster, mesh, mouse, camera) {
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObject(mesh);

    if (intersects.length > 0) {
        var intersect = intersects[0];
        var faceIndex = intersect.faceIndex;

        // two faces of an rectangle are allways right next to each other
        if (faceIndex % 2) {
            return mesh.geometry.faces[faceIndex - 1].a;
        } else {
            return mesh.geometry.faces[faceIndex].a;
        }
    } else {
        return -1;
    }
}