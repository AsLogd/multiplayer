var World = require('./world.js')
var Wall = require('./wall.js')
var Vector2D = require('./vector2d.js')
class Game{
    /*
        canvas : canvas element
        ctx : context2d
        players : Player[]
        world : Wall[]
    */
    constructor(){
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

        this.preTickTmstp = Date.now()
    }

    addPlayer(player){
        this.players.push(player)
    }

    getState(){
        return this.players
    }

    tick(){
        let deltaTime = (Date.now() - this.preTickTmstp)/1000
        this.preTickTmstp = Date.now()
        this.update(deltaTime)
    }

    update(deltaTime){
        for(let player of this.players){
            player.update(deltaTime)
        }
    }

}

module.exports = Game