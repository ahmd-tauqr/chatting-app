const http = require('http');
// 3rd party modules
const express = require('express');
// built-in modules
const path = require('path');
// socket library
const socketio = require('socket.io');
// bad word library
const Filter = require('bad-words');

// custom utils
const {
  generateMessage,
  generateLocationMessage,
  generateFileMessage,
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

// initialise the app
const app = express();

// http module create server
const server = http.createServer(app);

// initialise socket into server
const io = socketio(server);

// configure the app
const port = process.env.PORT || 3000;

// serve static files from public directory
const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

io.on('connection', (socket) => {
  // console.log("new socket connection is up!")

  // allow users to join room
  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      'message',
      generateMessage('Admin', `Welcome to ${user.room} chatroom.`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage(user.username, `${user.username} has joined!`)
      );

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }
    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  // when location is shared
  socket.on('sharelocation', (position, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(user.username, position)
    );
    callback();
  });

  //   when file is shared
  socket.on('fileShare', (file, callback) => {
    const user = getUser(socket.id);
    // console.log('=================================================>', user);
    // console.log('received', file);
    io.to(user.room).emit(
      'fileMessage',
      generateFileMessage(user.username, file.file)
    );
    callback();
  });

  // when a user leaves the chat
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has left.`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// kickstart the server
server.listen(port, () => {
  console.log(`server is running on port ${port}!`);
});
