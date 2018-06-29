document.addEventListener("DOMContentLoaded", ()=>{
    let g = new Game()
    const socket = io()
    socket.on('state', function (newState) {
        g.tick(newState)
    })

    keyboard = {}
    mapping = {
        'w':'jump',
        'a':'left',
        's':'down',
        'd':'right',
        'f':'attack',
        'r':'shield'
    }
    document.addEventListener('keydown',(ev)=>{
        keyboard[mapping[ev.key]] = true
        socket.emit('input', keyboard)
    })
    document.addEventListener('keyup',(ev)=>{
        keyboard[mapping[ev.key]] = false
        socket.emit('input', keyboard)
    })
})


