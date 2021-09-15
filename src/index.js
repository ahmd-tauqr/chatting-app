// 3rd party modules
const express = require('express');
// built-in modules
const path = require('path');

// initialise the app
const app = express();

// configure the app
const port = process.env.PORT || 3000;

// serve static files from public directory
const publicDirPath = path.join(__dirname, '../public')
app.use(express.static(publicDirPath));

// kickstart the server
app.listen(port, () => {
    console.log(`server is running on ${port}!`);
})