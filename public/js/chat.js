const socket = io()

// receive connection from server
socket.on('messageReceivedEvent', (message) =>{
    console.log(message)
})

// button
document.querySelector('#sendMessage').addEventListener('click', () => {
   const message = document.querySelector('#messageTextBox').value
    socket.emit('messageSent',message)
})