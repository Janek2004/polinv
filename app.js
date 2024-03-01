//const cors = require('cors');
//const express = require('express');

//const app = express();
//const httpServer = createServer(app);

require('./socketio');

/*app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).send('Hii ^-^ 😊');
})

app.get('*', (req, res) => {
    res.redirect('/');
})

const port = process.env.PORT ?? 3000;
httpServer.listen(port, () => {
    console.log(`App listening on port ${port}`);
})*/