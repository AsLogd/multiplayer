// Setup basic express server
var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000
var Game = require('./dist/server/game.js').default
var Player = require('./dist/server/player.js').default
var Vector2D = require('./dist/server/vector2d.js').default

let isServer = true
var g = new Game(isServer)

server.listen(port, ()=>{
	console.log("Server listening at port %d", port)
})

app.use(express.static(path.join(__dirname,'dist/public')))

function serverTick(){
	g.serverTick()
	let state = g.serialize()
	io.sockets.emit('state', state)
	setTimeout(serverTick, 16)
}

let colors = [
	'red',
	'blue',
	'purple',
	'yellow'
]

let positions = [
	new Vector2D(350, 100),
	new Vector2D(350, 150),
	new Vector2D(350, 200),
	new Vector2D(350, 250)
]

io.on('connection', (socket)=>{
	console.log("player connected")
	let id = g.world.players.length
	let player = new Player(
		id,
		g.world,
		positions[id],
		colors[id]
	)
	g.world.addPlayer(player)
	socket.emit('connected', {
		id: id
	})
	socket.on('input', (actions)=>{
		player.actions = actions
	})
})