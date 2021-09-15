const http = require('http')
// 3rd party modules
const express = require('express');
// built-in modules
const path = require('path');
// socket library
const socketio = require('socket.io')
// bad word library
const Filter = require('bad-words')

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

io.on('connection', (socket) => {
    console.log("new socket connection is up!")

    socket.emit('message','welcome to chat :)')
    // when a new user joins the chat
    // broadcast to others only
    socket.broadcast.emit('message', 'a new user joined!')

    socket.on('messageSent', (message, callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)) {
            console.log('warning! profanity is not allowed')
            io.emit('message',`warning! profanity is not allowed! ${filter.clean(message)}`)
            callback('delivered!')
        } else {
            io.emit('message',message)
        callback('message delivered!')
        }
        
    })
    // when a user leaves the chat
    socket.on('disconnect', () => {
        io.emit('message','a user has left the chat')
    })
    // when location is shared
    socket.on('sharelocation',(position, callback) =>{
        io.emit('message',`https://google.com/maps?q=${position.latitude},${position.longitude}`)
        callback('location shared!')
    })

})

// kickstart the server
server.listen(port, () => {
    console.log(`server is running on ${port}!`);
})