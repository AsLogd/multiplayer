class Player{
    /*
        pos : Vector2D
        color : string
        size : number
        keyboard: {action:bool}
        mapping: {key:action}
    */
    constructor(world, pos, color, players){
        this.JUMP_SPEED = 3
        this.SPEED = 2
        this.RANGE = 70
        this.IMPULSE = 0.1
        this.DRAG = 5
        this.SIDES = [
            'UP',
            'LEFT',
            'DOWN',
            'RIGHT'
        ]
        this.SHIELD_TIME = 0.5
        this.ATTACK_TIME = 0.2
        this.players = players
        this.world = world
        this.color = color
        this.pos = pos
        this.grounded = false
        this.walled = false
        this.shielded = false
        this.attacking = false
        this.attackingTime = 0
        this.remainingShield = 0
        this.canAttack = false
        this.canJump = false
        this.canShield = false
        this.vel = new Vector2D(0, 0)
        this.size = new Vector2D(20, 20)
        this.keyboard = {}
        this.mapping = {
            'w':'jump',
            'a':'left',
            's':'down',
            'd':'right',
            'f':'attack',
            'r':'shield'
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
        if(this.shielded)
        {
            ctx.beginPath();
            ctx.arc(this.pos.x,this.pos.y, this.size.x+5, 0,2*Math.PI);
            ctx.lineWidth = 5
            ctx.strokeStyle = '#008510'
            ctx.stroke();
        }
        if(this.attacking)
        {
            ctx.beginPath();
            ctx.arc(this.pos.x,this.pos.y,this.size.x+5,0,2*Math.PI);
            ctx.fillStyle = '#008510'
            ctx.fill();
        }
        
    }

    update(deltaTime){
        //Apply gravity
        this.vel.y += this.world.gravity * deltaTime
        if(this.vel.x > 0)
            this.vel.x -= this.DRAG * deltaTime
        else if(this.vel.x < 0)
            this.vel.x += this.DRAG * deltaTime

        //Process input
        if(this.keyboard.left)
            this.vel.x = Math.max(-this.SPEED, this.vel.x-this.SPEED)
        if(this.keyboard.right)
            this.vel.x = Math.min(this.SPEED, this.vel.x+this.SPEED)
        if(this.keyboard.down)
            this.vel.y = Math.min(this.SPEED, this.vel.y+this.SPEED)

        if(this.keyboard.jump){
            if(this.grounded){
                this.vel.y = -this.JUMP_SPEED
                this.keyboard.jump = false
            }
            else if(this.canJump)
            {
                this.vel.y = -this.JUMP_SPEED
                this.canJump = false
            }
            else if(this.walled){
                this.vel.y = -this.JUMP_SPEED
                //Inverted speed direction
                if(this.keyboard.left)
                    this.vel.x = this.JUMP_SPEED
                else if(this.keyboard.right)
                    this.vel.x = -this.JUMP_SPEED
                this.keyboard.jump = false
            }   
        }

        if(this.keyboard.attack && !this.shielded && !this.grounded &&!this.walled){
            if(this.canAttack)
            {
                this.attacking = true
                for(let player of this.players){
                    if(player !== this && !player.shielded && this.atRange(player))
                    {
                        let impactVec = player.pos.copy()
                        impactVec.substract(this.pos)
                        impactVec.mul(this.IMPULSE)
                        player.vel.set(impactVec.x, impactVec.y)
                    }
                }
                this.canAttack = false
            }
        }
        if(this.keyboard.shield && !this.attacking &&!this.grounded &&!this.walled)
        {
            if(this.canShield)
            {
                this.shielded = true
                this.canShield = false
            }
        }
        if(this.attacking)
        {
            this.attackingTime -= deltaTime
            if(this.attackingTime < 0)
                this.attacking = false
        }
        if(this.shielded)
        {
            this.remainingShield -= deltaTime
            if(this.remainingShield < 0)
                this.shielded = false
        }

        this.grounded = false

        let lastPos = this.pos.copy()
        //Check collisions on Y
        this.pos.y += this.vel.y
        
        for(let wall of this.world.walls)
        {
            if(this.collides(wall))
            {
                this.grounded = true
                this.canJump = true
                this.canAttack = true
                this.canShield = true
                if(!this.shielded)
                    this.remainingShield = this.SHIELD_TIME
                if(!this.attacking)
                    this.attackingTime = this.ATTACK_TIME
                this.vel.y = 0
                this.pos.y = lastPos.y
                
            }
        }

        this.walled = false
        //Check collisions on X
        lastPos = this.pos.copy()
        this.pos.x += this.vel.x
        for(let wall of this.world.walls)
        {
            if(this.collides(wall))
            {
                this.walled = true
                this.canAttack = true
                this.canShield = true
                if(this.shielded)
                    this.remainingShield = this.SHIELD_TIME
                if(this.attacking)
                    this.attackingTime = this.ATTACK_TIME
                this.vel.set(0,0)
                this.pos.x = lastPos.x
            }
        }


    }

    atRange(target){
        let targetVec = target.pos.copy()
        targetVec.substract(this.pos)
        let rangeSqr = this.RANGE*this.RANGE
        return (targetVec.x*targetVec.x + targetVec.y*targetVec.y < rangeSqr)
    }

    collides(b){
        return !(this.pos.x + this.size.x/2 < b.pos.x - b.size.x/2 ||
            b.pos.x + b.size.x/2 < this.pos.x - this.size.x/2 ||
            this.pos.y + this.size.y/2 < b.pos.y - b.size.y/2 ||
            b.pos.y + b.size.y/2 < this.pos.y - this.size.y/2)
    }

}