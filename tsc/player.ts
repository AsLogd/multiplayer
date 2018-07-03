import {Vector2D} from "./vector2d"
import {World} from "./world"

enum Direction{
    'UP' = 0,
    'LEFT',
    'DOWN',
    'RIGHT'
}

enum Action{
    'JUMP',
    'LEFT',
    'DOWN',
    'RIGHT',
    'ATTACK',
    'SHIELD'
}

export class Player{
    pos : Vector2D
    vel : Vector2D
    size : Vector2D
    players: Player[]
    world: World

    //{action:bool}
    actions: any = {}
    //{key:action}
    mapping: any = {
        'w':'jump',
        'a':'left',
        's':'down',
        'd':'right',
        'f':'attack',
        'r':'shield'
    }
    color : string = "black"
    grounded : boolean = false
    walled : boolean = false
    shielded : boolean = false
    attacking : boolean = false
    canAttack : boolean = false
    canJump : boolean = false
    canShield : boolean = false

    attackingTime : number = 0
    remainingShield : number = 0

    readonly JUMP_SPEED : number = 3 
    readonly MOVE_SPEED : number = 3 
    readonly DRAG : number = 3 
    readonly ATTACK_RANGE : number = 3 
    readonly ATTACK_IMPULSE : number = 3 
    readonly ATTACK_TIME : number = 3 
    readonly SHIELD_TIME : number = 3 
    
    constructor(world, pos, color, players){
        this.players = players
        this.world = world
        this.color = color
        this.pos = pos
        this.vel = new Vector2D(0, 0)
        this.size = new Vector2D(20, 20)
        this.initListeners()
    }

    initListeners(){
        document.addEventListener('keydown',(ev)=>{
            this.actions[this.mapping[ev.key]] = true
        })
        document.addEventListener('keyup',(ev)=>{
            this.actions[this.mapping[ev.key]] = false
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
        if(this.actions.left)
            this.vel.x = Math.max(-this.MOVE_SPEED, this.vel.x-this.MOVE_SPEED)
        if(this.actions.right)
            this.vel.x = Math.min(this.MOVE_SPEED, this.vel.x+this.MOVE_SPEED)
        if(this.actions.down)
            this.vel.y = Math.min(this.MOVE_SPEED, this.vel.y+this.MOVE_SPEED)

        if(this.actions.jump){
            if(this.grounded){
                this.vel.y = -this.JUMP_SPEED
                this.actions.jump = false
            }
            else if(this.canJump)
            {
                this.vel.y = -this.JUMP_SPEED
                this.canJump = false
            }
            else if(this.walled){
                this.vel.y = -this.JUMP_SPEED
                //Inverted speed direction
                if(this.actions.left)
                    this.vel.x = this.JUMP_SPEED
                else if(this.actions.right)
                    this.vel.x = -this.JUMP_SPEED
                this.actions.jump = false
            }   
        }

        if(this.actions.attack && !this.shielded && !this.grounded &&!this.walled){
            if(this.canAttack)
            {
                this.attacking = true
                for(let player of this.players){
                    if(player !== this && !player.shielded && this.atRange(player))
                    {
                        let impactVec = player.pos.copy()
                        impactVec.substract(this.pos)
                        impactVec.mul(this.ATTACK_IMPULSE)
                        player.vel.set(impactVec.x, impactVec.y)
                    }
                }
                this.canAttack = false
            }
        }
        if(this.actions.shield && !this.attacking &&!this.grounded &&!this.walled)
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
        let rangeSqr = this.ATTACK_RANGE*this.ATTACK_RANGE
        return (targetVec.x*targetVec.x + targetVec.y*targetVec.y < rangeSqr)
    }

    collides(b){
        return !(this.pos.x + this.size.x/2 < b.pos.x - b.size.x/2 ||
            b.pos.x + b.size.x/2 < this.pos.x - this.size.x/2 ||
            this.pos.y + this.size.y/2 < b.pos.y - b.size.y/2 ||
            b.pos.y + b.size.y/2 < this.pos.y - this.size.y/2)
    }

}