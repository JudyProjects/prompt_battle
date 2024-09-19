var obj = require("./app");
var io = require("socket.io")(obj.server);
var router = obj.express.Router();
var bodyParser = require("body-parser");
var session = require("express-session");
var sharedsession = require("express-socket.io-session");
const funciones = require("./resources/js/funciones");
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

io.sockets.on("connection", function (socket) {
  socket.emit("updateJugadores", jugadores);

  socket.on("disconnect", function () {
    if (socket.handshake.session.jugador) {
      // Eliminar de array
      quitarJugador(socket.handshake.session.jugador);
      //socket.destroy();
    }
  });

  // Para consultar con Bernardo
  /* socket.on('join', function (room) {
        console.log("socket:" + socket.handshake.session.jugador);
        socket.join(room);
        console.log("Se conectó a room: " + room);
    }); */

  // Actualiza la lista de jugadores disponibles en Lobby
  socket.on("obtenerJugadores", function () {
    socket.emit("updateJugadores", jugadores);
  });

  // Carga jugador disponible en Lobby
  socket.on("cargarJugador", function (data) {
    try {
      //Guardar en array
      jugadores.push(data);
      //Emitir a room de admins, para cargar lista de espera
      io.sockets.emit("updateJugadores", jugadores);
    } catch (error) {
      console.error(error.message);
    }
  });

  // Elimina jugador de la lista en Lobby
  socket.on("cancelarJugador", function (data) {
    quitarJugador(data);
  });

  // Carga el tema en BD
  socket.on("cargarTema", function (data) {
    //Cuando un usuario carga un tema en BD, se lo envía a los admins restantes
    socket.broadcast.emit("temaIngresado", {
      tema: data.tema,
    });
  });

  // Carga lo que escribe el jugador X en el input correspondiente de la pantalla ADMIN
  socket.on("jugadorEscribe", function (data) {
    io.sockets.emit("jugador-writing", {
      idPartida: data.idPartida,
      text: data.text,
      aliasJug: data.aliasJugador,
    });
  });

  // Carga las imágenes que escriben los jugadores X en el espacio correspondiente de la pantalla ADMIN
  socket.on("jugadorImagenes", function (data) {
    io.sockets.emit("jugador-imagenes", {
      idPartida: data.idPartida,
      imagenes: data.imagenes,
      aliasJug: data.aliasJugador,
    });
  });

  // Luego de instanciar en lobby, crea la partida en BD
  socket.on("iniciarPartida", async function (data) {
    try {
      //Devuelve array
      const temaRandom = await funciones.findTemaRandom();
      const partidaIniciada = await funciones.iniciarPartida(
        data.jugador1,
        data.jugador2,
        data.tiempoData,
        data.cantImagenesData,
        data.tipoVotoData,
        temaRandom[0].contenido
      );
      if (partidaIniciada) {
        socket.emit("redirectPartidaAdmin", {
          idPartida: partidaIniciada._id,
        });
      }
    } catch (error) {
      console.error(error);
    }
  });

  // Cuando el admin ingresa a la partida admin, emite este evento para redirigir a los jugadores
  socket.on("adminListo", function (data) {
    // Emitir a todos los sockets en la room
    io.sockets.emit("redirectPartidaJugadores", {
      idPartida: data.idPartida,
      jugador1: data.jugadores.jugador1,
      jugador2: data.jugadores.jugador2,
    });
    const tiempoEnMilisegundos = data.tiempo * 60000;
    // Aquí puedes agregar más lógica para hacer el seguimiento de la partida
    // y luego emitir 'finalizarPartida' después del tiempo correspondiente.
    setTimeout(() => {
      io.sockets.emit("finalizarPartida", { idPartida: data.idPartida });
    }, tiempoEnMilisegundos + 5000);
  });

  // Jugador envía la imagen para subirse a BD y ser redireccionado
  socket.on("jugadorFinalizaPartida", async function (data) {
    let partida, imgJug1, imgJug2;
    if (data.valorEnviado) {
      //Si el valor enviado es una img, obtiene los datos de partida
      try {
        partida = await funciones.findOnePartida(data.idPartida);
      } catch (error) {
        console.error(error);
      }
      //Realiza la comparación para ver quien la envió
      esJugador1 = partida.jugador1 == data.jugadorQueEnvia ? true : false;
      if (esJugador1) {
        imgJug1 = data.valorEnviado;
      } else {
        imgJug2 = data.valorEnviado;
      }
      //Actualiza partida en BD con la imagen seleccionada por el jugador que envió la imagen
      await funciones.editarPartida(data.idPartida, imgJug1, imgJug2, undefined, undefined);
      io.sockets.emit("redirectAvotacion", {
        idPartida: data.idPartida,
        jugador: data.jugadorQueEnvia,
      });
    } else {
      console.log("No se seleccionó imagen en partida");
    }
  });

  // Cuando la partida es de voto manual, se llama aquí con el jugador que debió ganar
  socket.on("ganadorVotacion", async function (data) {
    try {
      await funciones.editarPartida(data.idPartida, undefined, undefined, data.ganador, undefined);
    } catch (error) {
      console.error(error.message);
    }
    io.sockets.emit("finalizarVotacion", {
      idPartida: data.idPartida,
      ganador: data.ganador,
      votacion: false,
    });
  });

  // Cuando se termina la partida, y el usuario ingresa a la partida, se inicia la votación
  socket.on("initVotacion", async function (data) {
    try {
      await funciones.editarPartida(data.idPartida, undefined, undefined, undefined, true);
    } catch (error) {
      console.error(error.message);
    }
    let votacion = {
      idPartida: data.idPartida,
      jugadores: {
        jugador1: 0,
        jugador2: 0,
      },
    };
    io.sockets.emit("nuevaVotacion", {
      idPartida: data.idPartida,
      jugador1: data.jugador1,
      jugador2: data.jugador2,
    });
    votaciones.push(votacion);
    io.sockets.emit("iniciarVotacion", data);
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
            funciones.editarPartida(data.idPartida, undefined, undefined, ganadorFinal, false);
          } catch (error) {
            console.error(error.message);
          }
          io.sockets.emit("finalizarVotacion", {
            idPartida: data.idPartida,
            ganador: ganadorFinal,
            votacion: true,
          });
          break;
        }
      }
    }, 62000);
  });

  // Aumenta el voto en 1 del jugador correspondiente
  socket.on("sumarVoto", function (data) {
    for (const vot of votaciones) {
      if (vot.idPartida == data.idPartida) {
        if (data.jugadorAvotar == 1) {
          vot.jugadores.jugador1++;
        } else {
          vot.jugadores.jugador2++;
        }
        io.sockets.emit("actualizarVotos", {
          idPartida: data.idPartida,
          votacion: vot.jugadores,
        });
        break;
      }
    }
  });

  socket.on('obtenerVotos', function (data) {
    console.log(data);
    for (const vot of votaciones) {
      if (vot.idPartida == data) {
        console.log(vot.jugadores);
        socket.emit("actualizarVotos", {
          idPartida: data,
          votacion: vot.jugadores,
        });
        break;
      }
    }
  });
});

// Elimina el jugador disponible del array jugadores = []
function quitarJugador(alias) {
  jugadores.forEach(function (jugador, index) {
    if (jugador == alias) {
      //Eliminar de sesión
      //Eliminar de array
      jugadores.splice(index, 1);
      //Eliminar de lista de espera en LOBBY
      io.sockets.emit("updateJugadores", jugadores);
    }
  });
}

const jugadores = [];
const admins = [];
const votaciones = [];
