class Player{
    /*
        pos : Vector2D
        color : string
        size : number
        keyboard: {action:bool}
        mapping: {key:action}
    */
    constructor(world, pos, color){
        this.world = world
        this.color = color
        this.pos = pos
        this.vel = new Vector2D(0, 0)
        this.size = new Vector2D(20, 20)
        this.keyboard = {}
        this.mapping = {
            'w':'jump',
            'a':'left',
            's':'down',
            'd':'right'
        }
        this.initListeners()
    }

    initListeners(){
        document.addEventListener('keydown',(ev)=>{
            this.keyboard[this.mapping[ev.key]] = true
        })
        document.addEventListener('keyup',(ev)=>{
            this.keyboard[this.mapping[ev.key]] = false
        })
    }

    draw(ctx){
        ctx.fillStyle = this.color
        ctx.fillRect(
            this.pos.x-this.size.x/2, 
            this.pos.y-this.size.y/2, 
            this.size.x, 
            this.size.y
        )
    }

    update(deltaTime){
        let initialPosition = this.pos
        this.vel.y += this.world.gravity * deltaTime
        this.pos.y = this.pos.y + this.vel.y

        for(let wall of this.world.walls)
        {
            if(this.collides(wall))
            {
                this.vel.y = 0
                this.pos.y = wall.pos.y-this.size.y/2
            }
        }
        
    }

    collides(b){
        return !(this.pos.x + this.size.x/2 < b.pos.x - b.size.x/2 ||
            b.pos.x + b.size.x/2 < this.pos.x - this.size.x/2 ||
            this.pos.y + this.size.y/2 < b.pos.y - b.size.y/2 ||
            b.pos.y + b.size.y/2 < this.pos.y - this.size.y/2)
    }

}