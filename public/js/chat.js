const socket = io()

// receive connection from server
socket.on('messageReceivedEvent', (message) =>{
    console.log(message)
})

// button
document.querySelector('#chatbox').addEventListener('submit', (e) => {
   e.preventDefault()
    const message = e.target.elements.message.value
    socket.emit('messageSent',message)

})