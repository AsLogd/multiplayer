class Wall{
    /*
        pos : Vector2D
        size : Vector2D
    */
    constructor(color, pos, size){
        this.color = color
        this.pos = pos
        this.size = size
    }

    draw(ctx){
        ctx.fillStyle = this.color
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y)
    }
}