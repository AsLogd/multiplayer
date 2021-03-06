import Vector2D from "./vector2d"

export default class Wall{
    pos : Vector2D
    size : Vector2D
    color : string
    
    constructor(color:string, pos:Vector2D, size:Vector2D){
        this.pos = pos
        this.color = color
        this.size = size
    }

    draw(ctx:CanvasRenderingContext2D){
        ctx.fillStyle = this.color
        ctx.fillRect(
            this.pos.x-this.size.x/2, 
            this.pos.y-this.size.y/2, 
            this.size.x, 
            this.size.y
        )
    }
    /*
        Returns the list of vertexes of the wall.
        Anti-Clockwise from top-right (in increasing angle order)
    */
    getPoints() : Vector2D[]{
        let res = []
        
        //Top left
        res.push(
            new Vector2D(
                this.pos.x-this.size.x/2,
                this.pos.y-this.size.y/2,
            )
        )
        //Bottom left
        res.push(
            new Vector2D(
                this.pos.x-this.size.x/2,
                this.pos.y+this.size.y/2,
            )
        )
        //Bottom right
        res.push(
            new Vector2D(
                this.pos.x+this.size.x/2,
                this.pos.y+this.size.y/2,
            )
        )
        //Top right
        res.push(
            new Vector2D(
                this.pos.x+this.size.x/2,
                this.pos.y-this.size.y/2,
            )
        )
        return res
    }
}