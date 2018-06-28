class World{
    /*
        gravity: number
        walls: Wall[]
    */
    constructor(gravity, walls){
        this.gravity = gravity
        this.walls = walls
    }

    draw(ctx){
        for(let wall of this.walls)
        {
            wall.draw(ctx)
        }
    }
}