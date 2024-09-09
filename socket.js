var obj = require('./app');
var io = require("socket.io")(obj.server);
var router = obj.express.Router();
var uuid = require('uuid');
var session = require("express-session");
var sharedsession = require("express-socket.io-session");

var FileStore = require("session-file-store")(session);
var fileStoreOptions = {};

var sessionMiddleware = session({
    store: new FileStore(fileStoreOptions),
    secret: "ultrasecreto",
    resave: true,
    saveUninitialized: true,
});

router.use(sessionMiddleware);

io.use(sharedsession(sessionMiddleware));

io.sockets.on('connection', function (socket) {
    var llamadas = 0;

    socket.on('disconnect', function () {
        console.log('Un cliente se ha desconectado');
    });

    socket.on('generarImagenIA', function (data) {
        var prompt = data.prompt;
        var promptCodificado = encodeURIComponent(prompt);
        var url = 'https://image.pollinations.ai/prompt/${promptCodificado}?nologo=true&enhance=true&seed=1';
        var url2 = 'https://image.pollinations.ai/prompt/${promptCodificado}?nologo=true&enhance=true&seed=2';
        llamadas++;
        io.sockets.emit("URLarmada", {
            url: url, url2: url2, llamadas: llamadas
        });
    });

    socket.on('cargarJugador', function (data) {
        try {
            //Crear sesion con datos jugador
            var jugador = {
                id: uuid.v4(),
                alias: data.alias
            };
            socket.handshake.session.jugador = jugador;
            socket.handshake.session.save();
            //Guardar en array
            jugadores.push(jugador);
            //Emitir a room de admins, para cargar lista de espera
            io.emit('añadirJugadorEspera', jugador);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('eliminarJugador', function (data) {
        /* 
        Eliminar su sesión.
        Acá se deberá eliminar al jugador del array, y por ende, eliminarlo de la lista de espera.
        */
    });

    socket.on('cargarTema', async function (data) {
        try {
            io.sockets.emit('temaIngresado', {
                tema: data.tema
            });
        } catch (error) {
            console.error(error);
        }
    });
});

const jugadores = [];
const admins = [];