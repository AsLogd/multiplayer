import Wall from "./wall"
import Player from "./player"

export default class World{
    gravity: number
    walls: Wall[]
    players: Player[]
    constructor(gravity, walls){
        this.gravity = gravity
        this.walls = walls
    }

    draw(ctx){
        for(let wall of this.walls)
        {
            wall.draw(ctx)
        }
        for(let player of this.players)
        {
            player.draw(ctx)
        }
    }

    addPlayer(p:Player){
        this.players.push(p)

    }

    serialize(){
        let s ={
            players: []
        }

        for(let p of this.players)
        {
            s.players.push(p.serialize())
        }
        return s
    }
    fromData(data){
        for(let pd of data.players){
            this.players.fromData(pd)
        }
    }
}