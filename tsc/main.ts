import Game from "./game"

declare const io:any
document.addEventListener("DOMContentLoaded", ()=>{
    let g = new Game()
    const socket = io()
    socket.on('connected', (data)=>{

    })
    socket.on('state', (newState)=>{
    	g.fromData(newState)
    })
})