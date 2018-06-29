class Player{
    /*
        pos : Vector2D
        color : string
        size : number
        keyboard: {action:bool}
        mapping: {key:action}
    */
    constructor(id, world, pos, color, players){
        this.id = id
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

    fromData(d){
        this.color = d.color
        this.pos = new Vector2D(d.x, d.y)
        this.grounded = d.grounded
        this.walled = d.walled
        this.shielded = d.shielded
        this.attacking = d.attacking
        this.attackingTime = d.attackingTime
        this.remainingShield = d.remainingShield
        this.canAttack = d.canAttack
        this.canJump = d.canJump
        this.canShield = d.canShield
        this.vel = new Vector2D(d.vel.x, d.vel.y)
        this.size = new Vector2D(d.size.x, d.size.y)
        this.keyboard = d.keyboard
        this.mapping = {
            'w':'jump',
            'a':'left',
            's':'down',
            'd':'right',
            'f':'attack',
            'r':'shield'
        }
    }

   

}