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
        this.SIDES = [
            'UP',
            'LEFT',
            'DOWN',
            'RIGHT'
        ]
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
        //Apply gravity
        this.vel.y += this.world.gravity * deltaTime

        //Process input
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

        //Check collisions
        this.grounded = false
        for(let wall of this.world.walls)
        {
            if(this.collides(wall))
            {
                this.grounded = true
                this.vel.y = Math.min(this.vel.y,0)
                this.pos.y = (wall.pos.y-wall.size.y/2)-this.size.y/2
                
                let side = this.getCollisionSide(this, wall)
                /*
                switch(side)
                {
                    case 'LEFT':
                        this.vel.x = Math.min(this.vel.x,0)
                        this.pos.x = (wall.pos.x-wall.size.x/2)-this.size.x/2
                        break;
                    case 'RIGHT':
                        this.vel.x = Math.max(this.vel.x,0)
                        this.pos.x = (wall.pos.x+wall.size.x/2)+this.size.x/2
                        break;
                    case 'DOWN':
                        this.vel.y = Math.max(this.vel.y,0)
                        this.pos.y = (wall.pos.y+wall.size.y/2)+this.size.y/2
                        break;
                    default:
                        this.vel.y = Math.min(this.vel.y,0)
                        this.pos.y = (wall.pos.y-wall.size.y/2)-this.size.y/2
                        break;
                }
                */
                
            }
        }

        this.pos.sum(this.vel)

    }

    getCollisionSide(player, wall){
        let playerWallVec = new Vector2D(this.pos.x, this.pos.y)
        playerWallVec.substract(wall.pos)
        playerWallVec.y = -playerWallVec.y
        let playerAngle = Vector2D.angleWithGround(playerWallVec)
        let points = wall.getPoints()
        let i;
        for(i = 1; i < points.length; i++){
            let current = points[i]
            let centerToVertexVec = new Vector2D(wall.pos.x, wall.pos.y)
            current.substract(centerToVertexVec)
            current.y = -current.y
            let angle = Vector2D.angleWithGround(centerToVertexVec)
            //Player must be in the last interval
            if(playerAngle < angle)
                break;
        }
        
        return this.SIDES[i]
        
    }

    collides(b){
        return !(this.pos.x + this.size.x/2 < b.pos.x - b.size.x/2 ||
            b.pos.x + b.size.x/2 < this.pos.x - this.size.x/2 ||
            this.pos.y + this.size.y/2 < b.pos.y - b.size.y/2 ||
            b.pos.y + b.size.y/2 < this.pos.y - this.size.y/2)
    }

}