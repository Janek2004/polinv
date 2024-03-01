const cors = require("cors");
const express = require('express');
const { Server } = require("socket.io");

const app = express();

const io = new Server({ });

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).send('Hii ^-^ 😊😁');
})

app.get('*', (req, res) => {
    res.redirect('/');
})

io.on('connection', socket => {

    console.log(socket.id);

});

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})