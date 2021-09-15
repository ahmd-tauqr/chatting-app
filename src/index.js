const http = require('http')
// 3rd party modules
const express = require('express');
// built-in modules
const path = require('path');
// socket library
const socketio = require('socket.io')

// initialise the app
const app = express();

// http module create server
const server = http.createServer(app)

// initialise socket into server
const io = socketio(server)

// configure the app
const port = process.env.PORT || 3000;

// serve static files from public directory
const publicDirPath = path.join(__dirname, '../public')
app.use(express.static(publicDirPath));

let messages = []

io.on('connection', (socket) => {
    console.log("new socket connection is up!")

    socket.emit('messageReceivedEvent',messages.length > 0 ? messages[messages.length - 1] : 'welcome to chat app :)')
    socket.on('messageSent', (message) => {
        messages.push(message);
        io.emit('messageReceivedEvent',messages[messages.length - 1])
    })

})

// kickstart the server
server.listen(port, () => {
    console.log(`server is running on ${port}!`);
})