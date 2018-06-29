// Setup basic express server
var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000
var Game = require('./game.js')
var Player = require('./player.js')
var Vector2D = require('./vector2d.js')
var Wall = require('./wall.js')
var World = require('./world.js')

var g = new Game()

server.listen(port, () => {
  console.log('Server listening at port %d', port)
})

// Routing
app.use(express.static(path.join(__dirname, 'public')))

function logic(){
    setTimeout(logic, 16)
    g.tick()
    let state = {players:[]}
    for(let player of g.players)
    {
        state.players.push(player.getState())
    }
    io.sockets.emit('state', state.players)
}
logic()

let colors = [
    'red',
    'blue',
    'purple',
    'yellow'
]
io.on('connection', (socket)=>{
    console.log("player connected")
    let players = g.getState()
    let player = new Player(
        socket.id,
        g.world,
        new Vector2D(350,200), 
        colors[players.length],
        players
    );
    g.addPlayer(player)
    socket.on('input', function (keyboard) {
        console.log('got player input', keyboard)
        player.keyboard = keyboard
    })
})