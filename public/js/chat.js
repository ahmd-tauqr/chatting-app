const socket = io()

// element selectors
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('#messageInput')
const $messageFormButton = document.querySelector('#sendMessage')
const $shareLocationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// receive message from server
socket.on('message', (message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
      message:  message.text,
      createdAt: moment(message.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

// receive location message from server
socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        location,
        createdAt: moment(location.createdAt).format('h:m a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
})

// send message button
$messageForm.addEventListener('submit', (e) => {
   e.preventDefault()

   $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (message) => {
        $messageFormButton.removeAttribute('disabled','disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log(message)
    })
})

// share location button
$shareLocationBtn.addEventListener('click',() => {
   if(!navigator.geolocation) {
       return alert('geolocation is not supported by browser')
   }
   navigator.geolocation.getCurrentPosition((position) => {
       $shareLocationBtn.setAttribute('disabled','disabled')
       // send location
socket.emit('sharelocation', {
    latitude:position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy
},(message) => {
    $shareLocationBtn.removeAttribute('disabled','disabled')
    console.log(message)
})
   })
})

socket.emit('join', {
    username,
    room
})