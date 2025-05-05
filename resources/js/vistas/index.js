var socket = io();
const aliasJugador = document.getElementById("aliasJugador");
const currentPlayer = document.getElementById("currentPlayer");
const errorMessage = document.getElementById("error-message");
const botonJugar = document.querySelector('button[type="submit"]');
const waitingModal = document.getElementById('waitingModal');

waitingModal.addEventListener('hidden.bs.modal', function() {
    socket.emit("cancelarJugador", aliasJugador.value);
    aliasJugador.value = '';
});

botonJugar.addEventListener("click", function (e) {
	if (aliasJugador.value.trim().length > 0) {
		currentPlayer.textContent = aliasJugador.value;
		socket.emit("cargarJugador", aliasJugador.value);
	} else {
        e.preventDefault();
        e.stopPropagation();
		errorMessage.classList.remove('d-none');

        const modal = bootstrap.Modal.getInstance(document.getElementById('waitingModal'));
        if (modal) {
            modal.dispose();
        }
	}
});

aliasJugador.addEventListener("keydown", function (evt) {
	if (!errorMessage.classList.contains('d-none')) {
		errorMessage.classList.add('d-none');
	}
	if (evt.key == 'Enter') {
		if ( aliasJugador.value.trim().length > 0) {
			botonJugar.click();	
		} else {
			errorMessage.classList.remove('d-none');
		}
	}
});

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
