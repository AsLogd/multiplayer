// Setup basic express server
var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

var Constants = require('./dist/server/constants.js').default
var Game = require('./dist/server/game.js').default
var Player = require('./dist/server/player.js').default
var Vector2D = require('./dist/server/vector2d.js').default

let isServer = true
var g = new Game(isServer)

server.listen(port, ()=>{
	console.log("Server listening at port %d", port)
})

app.use(express.static(path.join(__dirname,'dist/public')))
//tick number
let t = 0

function serverTick(){
	g.serverTick()
	let state = g.serialize()
	t++
	state.tick = t
	io.sockets.emit('state', state)
	if(t % 30 == 0)
		console.log(JSON.stringify(state))
	setTimeout(serverTick, Constants.TICK_LENGTH)
}

let playerTest = new Player(
	"asdf",
	g.world,
	new Vector2D(200,200),
	"red"
)
g.world.addPlayer(playerTest)
serverTick()
/*
console.log(JSON.stringify(g.serialize()))
serverTick()
console.log(JSON.stringify(g.serialize()))
serverTick()
console.log(JSON.stringify(g.serialize()))
serverTick()
console.log(JSON.stringify(g.serialize()))
*/

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
	let n = g.world.players.length+""
	let player = new Player(
		socket.id,
		g.world,
		positions[n],
		colors[n]
	)
	g.world.addPlayer(player)
	socket.emit('connected')
	
	socket.on('input', (actions)=>{
		player.actions = actions
	})
	
	socket.on('sync-ping', ()=>{
		console.log('received ping')
		socket.emit('sync-pong')
	})
})
