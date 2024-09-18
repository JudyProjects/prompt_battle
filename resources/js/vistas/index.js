var socket = io.connect();
const aliasJugador = document.getElementById("aliasJugador");
const botonJugar = document.querySelector('button[type="submit"]');

botonJugar.addEventListener("click", function () {
  if (!botonJugar.classList.contains("active")) {
    botonJugar.classList.add("active");
    botonJugar.textContent = "Cancelar";
    socket.emit("cargarJugador", aliasJugador.value);
  } else {
    botonJugar.classList.remove("active");
    botonJugar.textContent = "¡Jugar!";
    socket.emit("cancelarJugador", aliasJugador.value);
    //var socket = io.disconnect();
  }
});

/* aliasJugador.addEventListener("keydown", function (evt) {
        if (evt.keyCode == "Enter") {
          botonJugar.classList.add("active");
          botonJugar.textContent = "Cancelar";
          socket.emit("cargarJugador", aliasJugador.value);
        }
      }); */

socket.on("redirectPartidaJugadores", function (data) {
  if (
    aliasJugador.value == data.jugador1 ||
    aliasJugador.value == data.jugador2
  ) {
    /* socket.emit("join", {
            idPartida: data.idPartida
          }); */
    localStorage.setItem("aliasJugador", aliasJugador.value);
    window.location.href = "/api/partida/" + data.idPartida;
  }
});
