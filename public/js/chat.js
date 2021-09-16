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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// autoscroll
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// receive message from server
socket.on('message', (message) => {
    // console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

// receive location message from server
socket.on('locationMessage', (message) => {
    // console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        location: message.location,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// Track users data in room
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// send message button action
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        // console.log('Message delivered!')
    })
})

// share location button action
$shareLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        $shareLocationBtn.setAttribute('disabled', 'disabled')
        // send location
        socket.emit('sharelocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $shareLocationBtn.removeAttribute('disabled', 'disabled')
            console.log("location shared.")
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})