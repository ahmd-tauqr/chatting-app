const socket = io()

// receive connection from server
socket.on('message', (message) =>{
    console.log(message)
})

// send message button
document.querySelector('#chatbox').addEventListener('submit', (e) => {
   e.preventDefault()
    const message = e.target.elements.message.value
    socket.emit('messageSent',message)
})

// share location button
document.querySelector('#sharelocation').addEventListener('click',() => {
   if(!navigator.geolocation) {
       return alert('geolocation is not supported by browser')
   }
   navigator.geolocation.getCurrentPosition((position) => {
       console.log(position)
       // send location
socket.emit('sharelocation', {
    latitude:position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy
})
   })
})

