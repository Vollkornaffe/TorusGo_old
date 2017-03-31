function torus(radius, tube, h_seg, w_seg) {
    this.params = {
        radius : radius,
        tube : tube,
        h_seg : h_seg,
        w_seg : w_seg,
        twist : 0
    };

    // hardcoded line offset, only to avoid z-fighting
    this.lineOffset = this.params.tube + this.params.tube / 100;

    // Indices for convinience
    this.quads = [];

    // Vectors
    this.offsets = [];
    this.lineOffsets = [];
    this.positions = [];
    this.linePositions = [];

    // Geometries
    this.geometry = new THREE.Geometry();
    this.w_lines = [];
    this.h_lines = [];

    this.calculateOffsets = function() {
        this.offsets = [];
        this.lineOffsets = [];
        for (var i = 0; i < this.params.w_seg; i++) {
            var i_rad = i / this.params.w_seg * 2 * Math.PI + this.params.twist;
            var offset = new THREE.Vector3(
                this.params.tube * Math.cos(i_rad),
                this.params.tube * Math.sin(i_rad),
                0
            );
            var lineOffset = new THREE.Vector3(
                this.lineOffset * Math.cos(i_rad),
                this.lineOffset * Math.sin(i_rad),
                0
            );
            this.offsets.push(offset);
            this.lineOffsets.push(lineOffset);
        }
    };

    this.calculatePositions = function() {
        this.positions = [];
        this.linePositions = [];
        var x_ax = new THREE.Vector3(1,0,0);
        var y_ax = new THREE.Vector3(0,1,0);
        for (var i = 0; i < this.params.w_seg; i++) {
            for (var j = 0; j < this.params.h_seg; j++) {
                var j_rad = j / this.params.h_seg * 2 * Math.PI;
                var newPos = new THREE.Vector3();
                var newLinePos = new THREE.Vector3();
                newPos.copy(this.offsets[i]);
                newLinePos.copy(this.lineOffsets[i]);
                newPos.addScaledVector(y_ax, this.params.radius);
                newPos.applyAxisAngle(x_ax, j_rad);
                newLinePos.addScaledVector(y_ax, this.params.radius);
                newLinePos.applyAxisAngle(x_ax, j_rad);
                this.positions.push(newPos);
                this.linePositions.push(newLinePos);
            }
        }
    };

    // Vertex positions are all unitialized, but face indices are set (also quads)
    this.init_geometry = function() {
        var vId = 0;
        for (var i = 0; i < this.params.w_seg; i++) {
            for (var j = 0; j < this.params.h_seg; j++) {
                var newVertex = new THREE.Vector3();
                this.geometry.vertices.push(newVertex);
                var w_seg = this.params.w_seg;
                var h_seg = this.params.h_seg;

                // generate faces
                if (i !== 0 && j !== 0) {
                    this.geometry.faces.push(new THREE.Face3(vId, vId - 1, vId - h_seg));
                    this.geometry.faces.push(new THREE.Face3(vId - 1, vId - h_seg, vId - 1 - h_seg));
                    this.quads[vId] = [vId, vId - 1, vId - h_seg, vId - 1 - h_seg];

                    if (j === h_seg - 1) {
                        this.geometry.faces.push(new THREE.Face3(vId - h_seg + 1, vId, vId - h_seg - h_seg + 1));
                        this.geometry.faces.push(new THREE.Face3(vId, vId - h_seg - h_seg + 1, vId - h_seg));
                        this.quads[vId - h_seg + 1] = [vId - h_seg + 1, vId, vId - h_seg - h_seg + 1, vId - h_seg];
                    }
                    if (i === w_seg - 1) {
                        this.geometry.faces.push(new THREE.Face3(j, j - 1, vId));
                        this.geometry.faces.push(new THREE.Face3(j - 1, vId, vId - 1));
                        this.quads[j] = [j, j - 1, vId, vId - 1];
                    }
                    if (i === w_seg - 1 && j === h_seg - 1) {
                        this.geometry.faces.push(new THREE.Face3(0, j, vId - h_seg + 1));
                        this.geometry.faces.push(new THREE.Face3(j, vId - h_seg + 1, vId));
                        this.quads[0] = [0, j, vId - h_seg + 1, vId];
                    }
                }
                vId++;
            }
        }
        this.geometry.computeBoundingSphere();
        this.geometry.dynamic = true;

        // lines
        // TODO: need to set line geometry to dynamic aswell?
        var lineMat = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 3});
        for (var i = 0; i < this.params.w_seg; i++) {
            var newLine = new THREE.Geometry();
            var start_and_end = new THREE.Vector3();
            newLine.vertices.push(start_and_end);
            for (var j = 1; j < this.params.h_seg; j++)
                newLine.vertices.push(new THREE.Vector3());
            newLine.vertices.push(start_and_end);
            this.w_lines.push(new THREE.Line(newLine, lineMat));
        }
        for (var i = 0; i < this.params.h_seg; i++) {
            var newLine = new THREE.Geometry();
            var start_and_end = new THREE.Vector3();
            newLine.vertices.push(start_and_end);
            for (var j = 1; j < this.params.w_seg; j++)
                newLine.vertices.push(new THREE.Vector3());
            newLine.vertices.push(start_and_end);
            this.h_lines.push(new THREE.Line(newLine, lineMat));
        }
    };

    this.positions_to_mesh = function() {
        var vertexIndex = 0;
        var faceIndex = 0;
        for (var i = 0; i < this.params.w_seg; i++) {
            for (var j = 0; j < this.params.h_seg; j++) {
                this.mesh.geometry.vertices[vertexIndex].copy(this.positions[vertexIndex]);
                vertexIndex++;
            }
        }
        this.mesh.geometry.verticesNeedUpdate = true;

        // same for lines
        vertexIndex = 0;
        for (var i = 0; i < this.params.w_seg; i++) {
            for (var j = 0; j < this.params.h_seg; j++) {
                this.w_lines[i].geometry.vertices[j].copy(this.linePositions[vertexIndex]);
                this.h_lines[j].geometry.vertices[i].copy(this.linePositions[vertexIndex]);
                vertexIndex++;
            }
        }
        this.w_lines.map(function(item) {item.geometry.verticesNeedUpdate = true; } );
        this.h_lines.map(function(item) {item.geometry.verticesNeedUpdate = true; } );
    };

    this.updateTorus = function() {
        this.calculateOffsets();
        this.calculatePositions();
        this.positions_to_mesh();
    };

    this.calculateOffsets();
    this.calculatePositions();
    this.init_geometry();
    this.mesh = new THREE.Mesh(
        this.geometry,
        new THREE.MeshPhongMaterial(
            {
                color: 0xc7aa52,
                shading: THREE.FlatShading,
                overdraw: 0.5,
                shininess: 0 ,
                side : THREE.DoubleSide
            })
    );
    this.positions_to_mesh();

    console.log("Created Torus");
}