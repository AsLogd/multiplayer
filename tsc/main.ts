import Game from "./game"

declare const io:any
document.addEventListener("DOMContentLoaded", ()=>{
    const socket = io()
    let g = new Game(false, socket)
    socket.on('state', g.reconcileState)
    socket.on('sync-pong', g.syncPong)
    socket.on('connected', ()=>{
    	g.syncPing()
    	socket.emit('sync-ping')
    })
})