import Player from "./player"
import Wall from "./wall"
import World from "./world"
import Vector2D from "./vector2d"
import Constants from "./constants"

/// <reference types="SocketIO" />

export default class Game{
    canvas : HTMLCanvasElement | undefined
    ctx : CanvasRenderingContext2D | undefined | null
    world : World
    isServer :boolean

    pingStart : number = -1
    pingHistory : number[] = []
    //Ground-truth state
    serverState : any
    lastConfirmedTick : number = -1
    //Predicted state
    clientState : any
    inputBuffer : any[] = []

    clientSocket: SocketIO.EngineSocket | undefined
    myPlayer : Player | undefined

    constructor(isServer?:boolean, clientSocket?:SocketIO.EngineSocket){
        this.isServer = isServer || false
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
        if(!this.isServer)
        {
            this.clientSocket = clientSocket
            this.canvas = document.createElement('canvas')
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
            document.body.appendChild(this.canvas)
            this.ctx = this.canvas.getContext('2d')
            this.lastConfirmedTick = -1
            this.tick()
            requestAnimationFrame(this.render)
            
        }
    }

    tick = ()=>{
        //We don't have state yet
        if(!this.clientState){
            setTimeout(this.tick, Constants.TICK_LENGTH)
            return
        }
        let newInput = this.cloneJSON(this.myPlayer!.actions)
        this.clientSocket!.emit('input', newInput)
        newInput.tick = this.clientState.tick+1
        this.inputBuffer.push(newInput)


        setTimeout(this.tick, Constants.TICK_LENGTH)
    }

    /*
        Computes ping by sending a request and
        measuring the delay of the response
    */
    syncPing = ()=>{
        this.pingStart = Date.now()
    }

    syncPong = ()=>{
        let ping = this.pingStart - Date.now()
        if(this.pingHistory.length < Constants.PING_BUFFER_LENGTH){
            this.pingHistory.push(ping)
        }
        else{
            this.pingHistory.shift()
            this.pingHistory.push(ping)
        }
        setTimeout(this.syncPing, 300)
    }
    /*
        Computes the mean of the n last pings
    */
    getPing(){
        if(this.pingHistory.length == 0) 
            return Infinity
        else
            return this.pingHistory.reduce((a, b)=>a+b, 0)/this.pingHistory.length
    }
    /*
        Receives a new state from server. Re-computes
        state until now
    */
    reconcileState = (newState:any)=>{
        let ping = this.getPing()
        if(ping == Infinity || newState.tick <= this.lastConfirmedTick) 
            return

        //Last confirmed tick
        this.lastConfirmedTick = newState.tick
        let errorMargin = Math.min(10, Constants.TICK_LENGTH/2)
        //The aproximated turns the client has to compute from 
        //the new state to be in "client present"
        //serverTick = now-ping
        //clientTick = server-ping-error
        //delta = now-client = now-(now-ping-ping-error)
        let forwardTicks = (2*ping + errorMargin)/Constants.TICK_LENGTH

        //Store the ground-truth server state
        this.serverState = newState

        //Dicard al processed inputs
        while(this.inputBuffer.length > 0 &&
            this.inputBuffer[0].tick <= newState.tick){
            this.inputBuffer.shift()
        }

        //Apply all inputs in the buffer
        //Here we are applying the inputs of the client,
        //and we can, at most, re-apply last inputs for other players
        this.clientState = this.inputBuffer.reduce((accState, currentInput)=>{
            return this.applyInput(accState, currentInput)
        }, newState)

        //In case we need more inputs than we have, the client loses
        //ticks (which are projections from last tick)
        let remainingTicks = forwardTicks - this.inputBuffer.length
        while(remainingTicks > 0){
            let lastInput = this.inputBuffer[this.inputBuffer.length-1]
            //Clone
            let newInput = this.cloneJSON(lastInput)
            newInput.tick++
            this.inputBuffer.push(newInput)
            this.clientState = this.applyInput(
                this.clientState, 
                newInput
            )
            this.clientSocket!.emit('input',newInput)
            remainingTicks--
        }

        //Update state
        this.fromData(this.clientState)

        //Get a reference to our player
        if(!this.myPlayer)
        {
            this.myPlayer = this.world.players.find((item)=>{
                return item.id.indexOf(this.clientSocket!.id) > -1
            })
            this.myPlayer!.initListeners()
        }

    }

    cloneJSON(json:any){
        return JSON.parse(JSON.stringify(json))
    }

    applyInput = (state:any, input:any)=>{
        for(let player of this.world.players){
            if(this.clientSocket!.id.indexOf(player.id+"") > -1)
            {
                player.actions = input
            }
            player.update(Constants.TICK_LENGTH)
        }
        state.tick = input.tick
    }

    serverTick = ()=>{
        //this.update(Constants.TICK_LENGTH)
        for(let player of this.world.players){
            player.update(Constants.TICK_LENGTH)
        }
    }

    update(deltaTime:number){
        for(let player of this.world.players){
            player.update(deltaTime)
        }
    }

    render = ()=>{
        //draw server and client state
        this.clear()
        this.world.draw(this.ctx!)
        requestAnimationFrame(this.render)
    }

    clear(){
        this.ctx!.fillStyle = 'white'
        this.ctx!.fillRect(0, 0, this.canvas!.width, this.canvas!.height)
    }

    serialize(){
        return this.world.serialize()
    }

    fromData(data:any){
        this.world.fromData(data)
    }
}
