const admin = require('firebase-admin');
const { Server } = require('socket.io');

const serviceAccount = JSON.parse(process.env['firebase']);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const io = new Server({});

const devices = new Map();

function verify_device(socket) {

    socket.isDevice = true;
    socket.name = socket.handshake.auth.name;
    devices.get(socket.uid).set(socket.id, socket.name);

}

io.use((socket, next) => {

    const token = socket.handshake.auth.token;
    if (typeof token !== 'string' || !token) next(new Error('Invalid token'));

    admin.auth().verifyIdToken(token).then(decodedToken => {
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        socket.uid = uid;
        socket.join(uid);
        socket.email = email;
        if (!devices.get(socket.uid)) devices.set(socket.uid, new Map());
        next();
    }).catch(err => next(new Error('Unauthorized')));

});

io.use((socket, next) => {

    socket.join(socket.id);
    if (socket.handshake.auth.device) verify_device(socket);
    next();

});

io.on('connection', socket => {

    console.log(`New socket connected (${socket.id}) -> ${socket.email}`);

    socket.on('cmd', (device_id, action) => {
        const validDevice = devices.get(socket.uid)?.get(device_id); // ? - hack ;D
        if (validDevice) socket.to(device_id).emit(action);
    });

    socket.on('disconnect', reason => {
        console.log(`Socket disconnected (${socket.id}) -> ${reason}`);
        if (socket.isDevice) {
            io.to(socket.uid).emit('device disconnected', socket.id, reason);
            devices.get(socket.uid).delete(socket.id);
        }
    });

});

module.exports = null