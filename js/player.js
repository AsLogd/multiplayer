class Player{
    /*
        pos : Vector2D
        color : string
        size : number
        keyboard: {action:bool}
        mapping: {key:action}
    */
    constructor(world, pos, color){
        this.JUMP_SPEED = 3
        this.SPEED = 2
        this.world = world
        this.color = color
        this.pos = pos
        this.grounded = false
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

        if(this.keyboard.jump && this.grounded){
            this.vel.y = -this.JUMP_SPEED
            this.keyboard.jump = false
        }
        if(this.keyboard.left)
            this.vel.x = -this.SPEED
        if(this.keyboard.right)
            this.vel.x = this.SPEED
        if(this.keyboard.down)
            this.vel.y = this.SPEED

        this.grounded = false
        for(let wall of this.world.walls)
        {
            if(this.collides(wall))
            {
                this.grounded = true
                this.vel.y = Math.min(this.vel.y,0)
                this.pos.y = (wall.pos.y-wall.size.y/2)-this.size.y/2
            }
        }

        this.pos.sum(this.vel)

    }

    collides(b){
        return !(this.pos.x + this.size.x/2 < b.pos.x - b.size.x/2 ||
            b.pos.x + b.size.x/2 < this.pos.x - this.size.x/2 ||
            this.pos.y + this.size.y/2 < b.pos.y - b.size.y/2 ||
            b.pos.y + b.size.y/2 < this.pos.y - this.size.y/2)
    }

}