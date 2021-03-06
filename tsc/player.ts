import Vector2D from "./vector2d"
import World from "./world"
import Wall from "./wall"

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

export default class Player {
    pos : Vector2D
    vel : Vector2D
    size : Vector2D
    world: World
    id :string
    //{action:bool}
    actions: any = {
        'tick': 0,
        'jump': false,
        'left': false,
        'down': false,
        'right': false,
        'attack': false,
        'shield': false
    }
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

    readonly JUMP_SPEED : number = 1
    readonly MOVE_SPEED : number = 1 
    readonly DRAG : number = 1 
    readonly ATTACK_RANGE : number = 3 
    readonly ATTACK_IMPULSE : number = 3 
    readonly ATTACK_TIME : number = 3 
    readonly SHIELD_TIME : number = 3 
    
    constructor(id="-1", world:World, pos=(new Vector2D(0,0)), color="black"){
        this.pos = pos
        this.id = id
        this.world = world
        this.color = color
        this.vel = new Vector2D(0, 0)
        this.size = new Vector2D(20, 20)
    }

    initListeners(){
        document.addEventListener('keydown',(ev)=>{
            console.log("keydown")
            this.actions[this.mapping[ev.key]] = true
        })
        document.addEventListener('keyup',(ev)=>{
            console.log("keyup")
            this.actions[this.mapping[ev.key]] = false
        })
    }

    draw(ctx:CanvasRenderingContext2D){
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

    update(deltaTime:number){
        //Apply gravity
        this.vel.y = Math.min(this.MOVE_SPEED, this.vel.y+this.world.gravity * deltaTime)

        //Aply drag
        if(Math.abs(this.vel.x) < 0.01)
            this.vel.x = 0
        else if(this.vel.x > 0)
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
                for(let player of this.world.players){
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

    atRange(target:Player){
        let targetVec = target.pos.copy()
        targetVec.substract(this.pos)
        let rangeSqr = this.ATTACK_RANGE*this.ATTACK_RANGE
        return (targetVec.x*targetVec.x + targetVec.y*targetVec.y < rangeSqr)
    }

    collides(b:Wall):boolean{
        return !(this.pos.x + this.size.x/2 < b.pos.x - b.size.x/2 ||
            b.pos.x + b.size.x/2 < this.pos.x - this.size.x/2 ||
            this.pos.y + this.size.y/2 < b.pos.y - b.size.y/2 ||
            b.pos.y + b.size.y/2 < this.pos.y - this.size.y/2)
    }

    serialize():any{
        let s = {
            id : this.id,
            pos : this.pos.serialize(),
            vel : this.vel.serialize(),
            size : this.size.serialize(),
            actions: this.actions,
            color : this.color,
            grounded : this.grounded,
            walled : this.walled,
            shielded : this.shielded,
            attacking : this.attacking,
            canAttack : this.canAttack,
            canJump : this.canJump,
            canShield : this.canShield,
            attackingTime : this.attackingTime,
            remainingShield : this.remainingShield
        }
        return s
    }

    fromData(data:any){
        this.id = data.id
        this.pos.fromData(data.pos)
        this.vel.fromData(data.vel)
        this.size.fromData(data.size)
        this.actions = data.actions
        this.color = data.color
        this.grounded = data.grounded
        this.walled = data.walled
        this.shielded = data.shielded
        this.attacking = data.attacking
        this.canAttack = data.canAttack
        this.canJump = data.canJump
        this.canShield = data.canShield
        this.attackingTime = data.attackingTime
        this.remainingShield = data.remainingShield
    }

}