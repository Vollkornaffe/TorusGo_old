function Torus(radius, tube, h_seg, w_seg) {
    this.params = {
        radius : radius,
        tube : tube,
        h_seg : h_seg,
        w_seg : w_seg,
        twist : 0,
        stone_size: 0.5
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
    this.rotatedVectors = [];

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

    this.calculateRotatedVectors = function() {
        this.rotatedVectors = [];
        var x_ax = new THREE.Vector3(1,0,0);
        for (var i = 0; i < this.params.w_seg; i++) {
            var i_rad = i / this.params.w_seg * 2 * Math.PI + this.params.twist;
            for (var j = 0; j < this.params.h_seg; j++) {
                var j_rad = j / this.params.h_seg * 2 * Math.PI;

                var rotated_vec = new THREE.Vector3( Math.cos(i_rad), Math.sin(i_rad), 0);
                rotated_vec.applyAxisAngle(x_ax, j_rad);
                this.rotatedVectors.push(rotated_vec);
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
        this.geometry.computeBoundingSphere();

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

    this.updateTorus = function(game_logic) {
        this.calculateOffsets();
        this.calculatePositions();
        this.calculateRotatedVectors();
        this.positions_to_mesh();
        this.updateTorus_with_gameLogic(game_logic);
    };

    this.get_quad_middle = function(id) {
        var middle = new THREE.Vector3(0,0,0);

        var quad = this.quads[id];
        var vertices = this.geometry.vertices;

        middle.addScaledVector(vertices[quad[0]], 0.25);
        middle.addScaledVector(vertices[quad[1]], 0.25);
        middle.addScaledVector(vertices[quad[2]], 0.25);
        middle.addScaledVector(vertices[quad[3]], 0.25);

        return middle;
    };

    this.white_mat = new THREE.MeshPhongMaterial( { color: 0xdbdad6, shading: THREE.FlatShading, overdraw: 0.5, shininess: 1 , side : THREE.DoubleSide} );
    this.black_mat = new THREE.MeshPhongMaterial( { color: 0x20201d, shading: THREE.FlatShading, overdraw: 0.5, shininess: 1 , side : THREE.DoubleSide} );

    this.stone_map = [];
    this.init_stone_map = function () {
        for (var i = 0; i < this.params.h_seg * this.params.w_seg; i++)
            this.stone_map.push(0);
    };
    this.stone_meshes = [];

    this.get_stone_geometry = function(id) {
        var quad = this.quads[id];
        var torus_vertices = this.geometry.vertices;
        var result = new THREE.Geometry();

        var stone_spike = this.get_quad_middle(id);
        stone_spike.addScaledVector(this.rotatedVectors[quad[0]], this.params.stone_size);
        stone_spike.addScaledVector(this.rotatedVectors[quad[1]], this.params.stone_size);
        stone_spike.addScaledVector(this.rotatedVectors[quad[2]], this.params.stone_size);
        stone_spike.addScaledVector(this.rotatedVectors[quad[3]], this.params.stone_size);

        result.vertices.push(stone_spike);
        result.vertices.push(torus_vertices[quad[0]]);
        result.vertices.push(torus_vertices[quad[1]]);
        result.vertices.push(torus_vertices[quad[2]]);
        result.vertices.push(torus_vertices[quad[3]]);

        result.faces.push(new THREE.Face3(0,1,2));
        result.faces.push(new THREE.Face3(0,1,3));
        result.faces.push(new THREE.Face3(0,3,4));
        result.faces.push(new THREE.Face3(0,4,2));

        return result;
    };

    this.updateTorus_with_gameLogic = function(game_logic) {
        for (var i in game_logic.positions) {
            if (this.stone_map[i] !== 0)
                scene.remove(this.stone_meshes[i]);
            switch (game_logic.positions[i].status) {
                case 1:
                    this.stone_meshes[i] = new THREE.Mesh(
                        this.get_stone_geometry(i),
                        this.white_mat
                    );
                    scene.add(this.stone_meshes[i]);
                    this.stone_map[i] = 1;
                    break;
                case -1:
                    this.stone_meshes[i] = new THREE.Mesh(
                        this.get_stone_geometry(i),
                        this.black_mat
                    );
                    scene.add(this.stone_meshes[i]);
                    this.stone_map[i] = -1;
                    break;
                case 0:
                    this.stone_map[i] = 0;
            }
        }
    };

    this.debug_highlight = function(pos_arr) {
        for (var idx in pos_arr) {
            var debug_stone = new THREE.Mesh(
                new THREE.SphereGeometry( this.params.stone_size * 1.1, 10, 10 ),
                new THREE.MeshPhongMaterial( { color: 0x33cc33 } )
            );
            var quad_middle = this.get_quad_middle(pos_arr[idx]);
            debug_stone.position.copy(quad_middle);
            scene.add(debug_stone);
        }
    };

    this.calculateOffsets();
    this.calculatePositions();
    this.init_geometry();
    this.init_stone_map();

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
    this.mesh.position.set(0,0,0);

    this.positions_to_mesh();

    console.log("Created Torus");
}