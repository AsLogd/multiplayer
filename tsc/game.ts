import {Player} from "./player"
import {Wall} from "./wall"
import {World} from "./world"
import {Vector2D} from "./vector2d"

export class Game{
    canvas : HTMLCanvasElement
    ctx : CanvasRenderingContext2D
    players : Player[]
    world : World
    preTickTmstp : number = 0
    
    constructor(){
        this.canvas = document.createElement('canvas')
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        document.body.appendChild(this.canvas)
        this.ctx = this.canvas.getContext('2d')
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
        this.players = []
        this.players.push(
            new Player(
                this.world,
                new Vector2D(300,200), 
                "red",
                this.players
            )
        )
        this.players.push(
            new Player(
                this.world,
                new Vector2D(350,200), 
                "blue",
                this.players
            )
        )
        this.preTickTmstp = Date.now()
        requestAnimationFrame(this.tick)
    }

    tick = ()=>{
        let deltaTime = (Date.now() - this.preTickTmstp)/1000
        this.preTickTmstp = Date.now()
        this.update(deltaTime)
        this.render()

        requestAnimationFrame(this.tick)
    }

    update(deltaTime){
        for(let player of this.players){
            player.update(deltaTime)
        }
    }

    render(){
        this.clear()
        this.world.draw(this.ctx)
        for(let player of this.players){
            player.draw(this.ctx)
        }
    }

    clear(){
        this.ctx.fillStyle = 'white'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
}