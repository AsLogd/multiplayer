import Wall from "./wall"
import Player from "./player"

export default class World{
    gravity: number
    walls: Wall[]
    players: Player[]
    constructor(gravity:number, walls:Wall[]){
        this.gravity = gravity
        this.walls = walls
        this.players = []
    }

    draw(ctx:CanvasRenderingContext2D){
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
        let s:any ={
            players: []
        }

        for(let p of this.players)
        {
            s.players.push(p.serialize())
        }
        return s
    }
    fromData(data:any){
        for(let pdata of data.players){
            let found = false
            let ps = this.players
            for(let i = 0; i < ps.length && !found; i++){
                if(ps[i].id == pdata.id){
                    ps[i].fromData(pdata)
                    found = true
                }
            }
            if(!found){
                let p = new Player(pdata.id, this)
                p.fromData(pdata)
                this.players.push(p)
            }
        }
    }
}