const cors = require('cors');
const express = require('express');

require('./socketio');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).send('Hii ^-^ 😊');
})

app.get('*', (req, res) => {
    res.redirect('/');
})

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})