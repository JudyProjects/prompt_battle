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
    io.emit('updateJugadores', jugadores);
    
    socket.on('disconnect', function () {
        if (socket.handshake.session.jugador) {
            // Eliminar de array
            //socket.destroy();
        }
    });

    socket.on('cargarJugador', function (data) {
        try {
            //Crear sesion con datos jugador
            socket.handshake.session.jugador = data;
            socket.handshake.session.save();
            //Guardar en array
            jugadores.push(data);
            //Emitir a room de admins, para cargar lista de espera
            io.sockets.emit('updateJugadores', jugadores);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('cancelarJugador', function (data) {
        jugadores.forEach(function (jugador, index) {
            if (jugador.alias == data) {
                //Eliminar de sesión
                //Eliminar de array
                jugadores.splice(index, 1);
                //Eliminar de lista de espera en LOBBY
                io.sockets.emit('updateJugadores', jugadores);
            }
        });
    });

    socket.on('cargarTema', async function (data) {
        //Cuando un usuario carga un tema en BD, se lo envía a los admins restantes
        socket.broadcast.emit('temaIngresado', {
            tema: data.tema
        });
    });
});

const jugadores = [];
const admins = [];
