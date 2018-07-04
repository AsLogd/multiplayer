import Player from "./player"
import Wall from "./wall"
import World from "./world"
import Vector2D from "./vector2d"

export default class Game{
    canvas : HTMLCanvasElement
    ctx : CanvasRenderingContext2D
    world : World
    preTickTmstp : number = 0
    isServer :boolean
    constructor(isServer?){
        this.isServer = isServer || false
        this.world = new World(3, [
            new Wall(
                'black', 
                new Vector2D(300,300),
                new Vector2D(300, 10)
            ),
            new Wall(
                'black', 
                new Vector2D(350,250),
                new Vector2D(50, 10)
            ),
            new Wall(
                'black', 
                new Vector2D(400,250),
                new Vector2D(50, 10)
            )
        ])
        if(!this.isServer)
        {
            this.canvas = document.createElement('canvas')
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
            document.body.appendChild(this.canvas)
            this.ctx = this.canvas.getContext('2d')
            this.preTickTmstp = Date.now()
            requestAnimationFrame(this.tick)
            
        }
    }

    tick = ()=>{
        let deltaTime = (Date.now() - this.preTickTmstp)/1000
        this.preTickTmstp = Date.now()
        this.update(deltaTime)
        this.render()

        requestAnimationFrame(this.tick)
    }
    
    serverTick = ()=>{
        let deltaTime = (Date.now() - this.preTickTmstp)/1000
        this.preTickTmstp = Date.now()
        this.update(deltaTime)
    }

    update(deltaTime){
        for(let player of this.world.players){
            player.update(deltaTime)
        }
    }

    render(){
        this.clear()
        this.world.draw(this.ctx)
    }

    clear(){
        this.ctx.fillStyle = 'white'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    serialize(){
        return this.world.serialize()
    }

    fromData(data){
        this.world.fromData(data)
    }
}
