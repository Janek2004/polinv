const express = require("express");
var cors = require('cors');
const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

require('./socketio')(io);

app.use(cors());
app.use(express.json());

const port = 3000;
server.listen(port, () => {
    console.log(`Server running on ${port} port.`);
});
