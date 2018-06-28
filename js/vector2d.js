class Vector2D{
    constructor(x, y){
        this.x = x
        this.y = y
    }

    set(x, y){
        this.x = x
        this.y = y
    }

    sum(b){
        this.x += b.x
        this.y += b.y
    }
}