const users = [];

const addUser = ({id, username, room}) => {
  // clean and sanitise data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // validate data
  if (!username || !room) {
    return {
      error: "Username and Room are required!"
    }
  }
  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  // Validate username
  if (existingUser) {
    return {
      error: "Username is taken."
    }
  }

  // Store User
  const user = {id, username, room}
  users.push(user)
  return {
    user
  }

}

// Remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

// Get particular user
const getUser = (id) => {
  return users.find((user) => user.id === id)
}

// Get all users in a room
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room.toLowerCase())
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}