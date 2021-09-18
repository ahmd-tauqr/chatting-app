const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (username, location) => {
  return {
    username,
    location,
    createdAt: new Date().getTime(),
  };
};

const generateFileMessage = (username, file) => {
  return {
    username,
    file,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage,
  generateFileMessage,
};
