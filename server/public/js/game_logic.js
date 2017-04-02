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
        this.pos = x*width + y;
        this.status = 0;
        this.neighbors = [];
        this.neighbors.push(((x + 1 > width - 1) ? 0 : x + 1)*width + y);
        this.neighbors.push(((x - 1 < 0) ? width - 1 : x - 1)*width + y);
        this.neighbors.push(x*width + ((y - 1 < 0) ? height - 1 : y - 1));
        this.neighbors.push(x*width + ((y + 1 > height - 1) ? 0 : y + 1));

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

    this.make_move = function () {
        if (currentSelection === -1)
            return;
        this.positions[currentSelection].status = 1;
    };

    console.log("Created GameLogic")
    return this;
}