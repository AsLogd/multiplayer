export default class Vector2D{
    x : number
    y : number

    constructor(x:number, y:number){
        this.x = x
        this.y = y
    }

    set(x:number, y:number){
        this.x = x
        this.y = y
    }

    sum(b:Vector2D){
        this.x += b.x
        this.y += b.y
    }

    substract(b:Vector2D){
        this.x -= b.x
        this.y -= b.y
    }
    mul(escalar:number){
        this.x *= escalar
        this.y *= escalar
    }

    copy() : Vector2D{
        return new Vector2D(this.x, this.y)
    }

    serialize(){
        return {x:this.x, y:this.y}
    }

    fromData(data:any){
        this.x = data.x
        this.y = data.y
    }

    static dot(a:Vector2D, b:Vector2D) : number{
        return a.x*b.x + a.y*b.y
    }

    static angleWithGround(a:Vector2D) : number{
        let angle = Math.atan2(a.x, a.y)*(180/Math.PI)
        if(angle < 0)
            return angle*2*Math.PI
        else 
            return angle
    }
}