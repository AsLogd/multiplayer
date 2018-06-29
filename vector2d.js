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

    substract(b){
        this.x -= b.x
        this.y -= b.y
    }
    mul(escalar){
        this.x *= escalar
        this.y *= escalar
    }
    copy(){
        return new Vector2D(this.x, this.y)
    }
    toObj(){
        return {x: this.x, y:this.y}
    }

    static dot(a, b){
        return a.x*b.x + a.y*b.y
    }

    static angleWithGround(a){
        let angle = Math.atan2(a.x, a.y)*(180/Math.PI)
        if(angle < 0)
            return angle*2*Math.PI
        else 
            return angle
    }
}

module.exports = Vector2D