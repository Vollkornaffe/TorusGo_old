function contains(arr, ele)
{
    for (var i = 0; i < arr.length; i++)
        if(arr[i] === ele)
            return true;
    return false;
}

function game_logic(width, height)
{
    this.positions = [];

    function board_position(x,y) // Neighbors: up down left right
    {
        this.pos = x*height + y;
        this.status = 0;
        this.neighbors = [];
        this.neighbors.push(((x + 1 > width - 1) ? 0 : x + 1)*height + y);
        this.neighbors.push(((x - 1 < 0) ? width - 1 : x - 1)*height + y);
        this.neighbors.push(x*height + ((y - 1 < 0) ? height - 1 : y - 1));
        this.neighbors.push(x*height + ((y + 1 > height - 1) ? 0 : y + 1));

        return this;
    }
    for (var i = 0; i < width; i++) // Fill board_positions
    {
        for (var j = 0; j < height; j++)
        {
            var new_position = new board_position(i,j);
            this.positions.push(new_position);
        }
    }

    this.get_position = function(pos) // For x,y coordinates
    {
        if (pos[0] < width && pos[1] < height)
            return this.positions[pos[0]*width + pos[1]];
        return null;
    };
    this.free_flat = function(bp) // Find direct freedoms
    {
        var res = [];
        for (var i = 0; i < 4; i++)
            if (this.get_posistion(bp.neighbors[i]).status === 0)
                res.push(bp.neighbors[i]);
        return res;
    };
    this.free_deep = function(bp) // Find direct & indirect freedoms
    {
        if (bp.status === 0)
            return null;
        var pl = bp.status;
        var res = [];
        var done = [];
        var next = [bp.pos];

        while(next.length !== 0)
        {
            var current = this.positions[next[0]];
            done.push(next[0]);
            for (var i = 0; i < 4; i++)
            {
                var current_n = this.positions[current.neighbors[i]];
                if (!contains(done, current_n.pos))
                {
                    if (current_n.status === 0)
                        res.push(current_n.pos);
                    if (current_n.status === pl)
                        next.push(current_n.pos);
                    done.push(current_n.pos);
                }
            }

            next.splice(0,1);
        }
        return res;
    };
    this.group = function(bp) // Find group
    {
        if (bp.status === 0)
            return null;
        var pl = bp.status;
        var res = [bp.pos];
        var done = [];
        var next = [bp.pos];
        while(next.length !== 0)
        {
            console.log(JSON.stringify(done));
            console.log(JSON.stringify(res));
            var current = this.positions[next[0]];
            done.push(next[0]);
            for (var i = 0; i < 4; i++)
            {
                var current_n = this.positions[current.neighbors[i]];
                if (!contains(done, current.neighbors[i]))
                {
                    if (current_n.status === pl) {
                        res.push(current.neighbors[i]);
                        next.push(current.neighbors[i]);
                    }
                    done.push(current.neighbors[i]);
                }
            }

            next.splice(0,1);
        }
        return res;
    };

    this.move_legal = function(selected_position)
    {
        if (selected_position.status === 0)
            return true;
        return false;
    };


    this.kill_neighbors = function(selected_position) // assuming that the move doesn't kill own stones..
    {
        var this_ref = this;
        for (var n_id in selected_position.neighbors) {
            var neighbor = this.positions[selected_position.neighbors[n_id]];
            if (neighbor.status !== current_player * -1)
                continue;
            if (this.free_deep(neighbor).length === 1)
                this.group(neighbor).map(
                    function(group_member_id) {
                        this_ref.positions[group_member_id].status = 0;
                    }
                );
        }
    };

    this.make_move = function () {
        if (currentSelection === -1)
            return;

        console.log("Making move at ", currentSelection);

        var selected_position = this.positions[currentSelection];
        if (this.move_legal(selected_position)) {
            this.kill_neighbors(selected_position);

            selected_position.status = current_player;
            current_player *= -1;
        } else {
            alert("Illegal Move!");
        }
    };

    console.log("Created GameLogic")
    return this;
}