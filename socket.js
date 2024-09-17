var obj = require('./app');
var io = require("socket.io")(obj.server);
var router = obj.express.Router();
var bodyParser = require('body-parser');
var session = require("express-session");
var sharedsession = require("express-socket.io-session");
var TemaModel = require('./models/Tema.model');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

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
            quitarJugador(socket.handshake.session.jugador);
            //socket.destroy();
        }
    });

    /* socket.on('join', function (room) {
        console.log("socket:" + socket.handshake.session.jugador);
        socket.join(room);
        console.log("Se conectó a room: " + room);
    }); */

    socket.on('obtenerJugadores', function () {
        socket.emit('updateJugadores', jugadores);
    });

    socket.on('cargarJugador', function (data) {
        try {
            //Guardar en array
            jugadores.push(data);
            //Emitir a room de admins, para cargar lista de espera
            io.sockets.emit('updateJugadores', jugadores);
        } catch (error) {
            console.error(error.message);
        }
    });

    socket.on('cancelarJugador', function (data) {
        quitarJugador(data);
    });

    socket.on('cargarTema', function (data) {
        //Cuando un usuario carga un tema en BD, se lo envía a los admins restantes
        socket.broadcast.emit('temaIngresado', {
            tema: data.tema
        });
    });

    socket.on('jugadorEscribe', function (data) {
        io.sockets.emit('jugador-writing', {
            idPartida: data.idPartida,
            text: data.text,
            aliasJug: data.aliasJugador
        });
    });

    socket.on('jugadorImagenes', function (data) {
        io.sockets.emit('jugador-imagenes', {
            idPartida: data.idPartida,
            imagenes: data.imagenes,
            aliasJug: data.aliasJugador
        });
    });

    socket.on('iniciarPartida', async function (data) {
        try {
            const temaRandom = await TemaModel.aggregate([{ $sample: { size: 1 } }]);
            const response = await fetch("http://localhost:1234/api/auth/iniciarPartida", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jugador1: data.jugador1,
                    jugador2: data.jugador2,
                    tiempo: data.tiempoData,
                    cantImagenes: data.cantImagenesData,
                    tipoVoto: data.tipoVotoData,
                    tematica: temaRandom[0].contenido
                })
            });

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const responseData = await response.json(); // Parsear JSON si la respuesta es válida

                if (response.ok && responseData) {
                    socket.emit('redirectPartidaAdmin', {
                        idPartida: responseData._id
                    });
                } else {
                    throw new Error(`Error al cargar temas: ${response.status}`);
                }
            } else {
                // La respuesta no es JSON
                console.log("La respuesta no es un JSON:", await response.text()); // Mostrar el HTML recibido
                throw new Error(`Error en la respuesta del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error(error);
        }
    });


    socket.on('adminListo', function (data) {
        // Emitir a todos los sockets en la room
        io.sockets.emit('redirectPartidaJugadores', {
            idPartida: data.idPartida,
            jugador1: data.jugadores.jugador1,
            jugador2: data.jugadores.jugador2
        });
        const tiempoEnMilisegundos = data.tiempo * 60000;
        // Aquí puedes agregar más lógica para hacer el seguimiento de la partida
        // y luego emitir 'finalizarPartida' después del tiempo correspondiente.
        setTimeout(() => {
            io.sockets.emit('finalizarPartida', { idPartida: data.idPartida });
        }, tiempoEnMilisegundos + 5000);
    });

    socket.on('jugadorFinalizaPartida', async function (data) {
        let partida, imgJug1, imgJug2;
        if (data.valorEnviado) {
            //Si el valor enviado es una img, obtiene los datos de partida
            try {
                const response = await fetch("http://localhost:1234/api/datosPartida/" + data.idPartida, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                // Verificar si la respuesta es JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const responseData = await response.json(); // Parsear JSON si la respuesta es válida
                    if (response.ok && responseData) {
                        partida = responseData;
                    } else {
                        throw new Error(`Error al obtener partida: ${response.status}`);
                    }
                } else {
                    // La respuesta no es JSON
                    console.log("La respuesta no es un JSON:", await response.text()); // Mostrar el HTML recibido
                    throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                }
                } catch (error) {
                    console.error(error);
                }
                console.log(data.jugadorQueEnvia + " de imgJug: " + data.valorEnviado);
                //Realiza la comparación para ver quien la envió
                esJugador1 = partida.jugador1 == data.jugadorQueEnvia ? true : false;
                if (esJugador1) {
                    imgJug1 = data.valorEnviado;
                } else {
                    imgJug2 = data.valorEnviado;
                }
                console.log(data.jugadorQueEnvia + " img1 e img2 "+ imgJug1, imgJug2);
                //Actualiza partida en BD con la imagen seleccionada por el jugador que envió la imagen
                try {
                    await fetch("http://localhost:1234/api/editarPartida/" + data.idPartida, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            imgJug1: imgJug1,
                            imgJug2: imgJug2
                        })
                    });
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.log('No se seleccionó imagen en partida');
            }
        });

        socket.on('ganadorVotacion', async function(data) {
            try {
                await fetch("http://localhost:1234/api/editarPartida/" + data.idPartida, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ganador: data.ganador
                    })
                });
            } catch (error) {
                console.error(error.message);
            }
            io.sockets.emit('finalizarVotacion', {
                idPartida: data.idPartida,
                ganador: data.ganador,
                votacion: false
            });
        });

        socket.on('initVotacion', async function(data) {
            try {
                fetch("http://localhost:1234/api/editarPartida/" + data.idPartida, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        listaParaVotar:  true
                    })
                });
            } catch (error) {
                console.error(error.message);
            }
            let votacion = {
                idPartida: data.idPartida,
                jugadores: {
                    jugador1: 0,
                    jugador2: 0
                }
            }
            io.sockets.emit('nuevaVotacion', {
                idPartida: data.idPartida,
                jugador1: data.jugador1,
                jugador2: data.jugador2
            });
            votaciones.push(votacion);
            io.sockets.emit('iniciarVotacion', data);
            setTimeout(() => {
                for (const vot of votaciones) {
                    if (vot.idPartida == data.idPartida) {
                        let ganadorFinal = "empate";
                        if (vot.jugadores.jugador1 > vot.jugadores.jugador2) {
                            ganadorFinal = data.jugador1;
                        } else if (vot.jugadores.jugador1 < vot.jugadores.jugador2) {
                            ganadorFinal = data.jugador2;
                        }
                        try {
                            fetch("http://localhost:1234/api/editarPartida/" + data.idPartida, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    ganador:  ganadorFinal,
                                    listaParaVotar: false
                                })
                            });
                        } catch (error) {
                            console.error(error.message);
                        }
                        io.sockets.emit('finalizarVotacion', {
                            idPartida: data.idPartida,
                            ganador: ganadorFinal,
                            votacion: true
                        });
                        break;
                    }
                }
            }, 60000);
        });

        socket.on('sumarVoto', function(data) {
            for (const vot of votaciones) {
                if (vot.idPartida == data.idPartida) {
                    if (data.jugadorAvotar == 1) {
                        vot.jugadores.jugador1++;
                    } else {
                        vot.jugadores.jugador2++;
                    }
                    io.sockets.emit('actualizarVotos', {
                        idPartida: data.idPartida,
                        votacion: vot.jugadores
                    });
                    break;
                }
            }
        });
});

function quitarJugador(alias) {
    jugadores.forEach(function (jugador, index) {
        if (jugador == alias) {
            //Eliminar de sesión
            //Eliminar de array
            jugadores.splice(index, 1);
            //Eliminar de lista de espera en LOBBY
            io.sockets.emit('updateJugadores', jugadores);
        }
    });
}

const jugadores = [];
const admins = [];
const votaciones = [];
