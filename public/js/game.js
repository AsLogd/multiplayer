class Game{
    /*
        canvas : canvas element
        ctx : context2d
        players : Player[]
        world : Wall[]
    */
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
        this.myPlayer = 0
        this.preTickTmstp = Date.now()
    }

    setPlayer(player){
        this.player = player
    }

    tick(playersData){
        this.players = []
        for(let d of playersData)
        {
            let p = new Player()
            p.fromData(d)
            p.players = this.players
            this.players.push(p)
        }
        this.players = this.players
        this.render()

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
