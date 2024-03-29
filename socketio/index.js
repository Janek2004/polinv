const admin = require('firebase-admin');

const serviceAccount = {
    "type": "service_account",
    "project_id": process.env['project_id'],
    "private_key_id": process.env['private_key_id'],
    "private_key": process.env['private_key'],
    "client_email": process.env['client_email'],
    "client_id": process.env['client_id'],
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env['client_x509_cert_url'],
    "universe_domain": "googleapis.com"
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const devices = new Map();

function verify_device(socket) {

    socket.isDevice = true;
    socket.name = socket.handshake.auth.name;
    devices.get(socket.uid).set(socket.id, {
        name: socket.name,
        events: socket.handshake.auth.events
    });

}

//function check_token(socket) { }

function on_connection(io, socket) {

    console.log(`New socket connected (${socket.id}) (${socket.isDevice ? 'device' : 'user'}) -> ${socket.email}`);

    io.to('user_' + socket.uid).emit('devices', Object.fromEntries(devices.get(socket.uid)));

    socket.on('action', (device_id, action, data) => {
        const validDevice = devices.get(socket.uid).has(device_id); // TODO: Do not check for valid device, make code to emit actions to '${socket.uid}_${device_id}'
        if (validDevice) io.to(device_id).emit(action, data);
    });

    socket.on('answer', data => socket.to('user_' + socket.uid).emit('answer', socket.id, data));

    socket.on('disconnect', reason => {
        console.log(`Socket disconnected (${socket.id}) -> ${reason}`);
        if (socket.isDevice) {
            devices.get(socket.uid).delete(socket.id);
            const user_devices = Object.fromEntries(devices.get(socket.uid));
            io.to('user_' + socket.uid).emit('devices', user_devices);
        }
    });

}

module.exports = io => {

    io.use((socket, next) => {

        const token = socket.handshake.auth.token;
        if (typeof token !== 'string' || !token) return next(new Error('Invalid token'));

        admin.auth().verifyIdToken(token).then(decodedToken => {
            const uid = decodedToken.uid;
            const email = decodedToken.email;
            socket.uid = uid;
            socket.email = email;
            if (!devices.get(socket.uid)) devices.set(socket.uid, new Map());
            next();
        }).catch(err => next(new Error('Unauthorized')));

    });

    io.use((socket, next) => {

        socket.join(socket.id);
        socket.join(socket.uid);
        if (socket.handshake.auth.device) verify_device(socket);
        else socket.join('user_' + socket.uid);
        next();

    });

    io.on('connection', socket => on_connection(io, socket));

}
