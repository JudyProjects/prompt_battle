var socket = io.connect();
const btnCargarTemas = document.querySelector("#btnCargarTemas");
const listaJugadores = document.getElementById("listaJugadores");
const listaTemas = document.getElementById("listaTemas");
const btnIniciarPartida = document.querySelector("#btnIniciarPartida");
const btnCerrarSesion = document.querySelector("#btnCerrarSesion");

// Cuando se carga la página, hace un llamado para obtener los temas almacenados en BD
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/api/auth/obtenerTemas");
    console.log(response);
    if (response.status == 404) {
      const li = document.createElement("li");
      li.classList.add("vacio");
      li.textContent = "No hay temas disponibles";
      listaTemas.appendChild(li);
      return;
    } else if (!response.ok) {
      throw new Error("Error al obtener temas");
    }
    const data = await response.json();
    data.forEach((tema) => {
      const li = document.createElement("li");
      li.textContent = tema.contenido;
      listaTemas.appendChild(li);
    });
  } catch (error) {
    console.log(error);
  }
  socket.emit("obtenerJugadores");
});

// Actualiza lista de jugadores
socket.on("updateJugadores", function (data) {
  listaJugadores.innerHTML = "";
  data.forEach((jugador) => {
    const liJugador = document.createElement("li");
    liJugador.textContent = jugador;
    listaJugadores.appendChild(liJugador);
  });
  $(function () {
    $(".selectJugadores").select2({
      data: data,
      multiple: true,
      placeholder: "Seleccione dos jugadores",
      maximumSelectionLength: 2,
      language: {
        maxLength: function () {
          return "Solo puedes seleccionar hasta 2 jugadores";
        },
      },
    });
  });
});

// Evento para cargar temas en la base de datos
btnCargarTemas.addEventListener("click", async function () {
  let cargarTemas = document.querySelector("#cargarTemas");
  btnCargarTemas.setAttribute("disabled", "disabled");
  try {
    console.log(cargarTemas.value);
    const response = await fetch("/api/auth/cargarTema", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tema: cargarTemas.value,
      }),
    });

    if (!response.ok) {
      var resStat = JSON.stringify(response.status);
      throw new Error(`Error al cargar temas: ${resStat}`);
    }
    const data = await response.json();
    if (data) {
      btnCargarTemas.removeAttribute("disabled");
      if (listaTemas.firstChild.classList.contains("vacio")) {
        listaTemas.firstChild.remove();
      }
      const li = document.createElement("li");
      li.textContent = data.contenido;
      listaTemas.appendChild(li);
      cargarTemas.value = "";
      socket.emit("cargarTema", {
        tema: data.contenido,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

// Cuando otro admin carga un tema, lo carga en la pantalla de los admins restantes
socket.on("temaIngresado", function (data) {
  btnCargarTemas.removeAttribute("disabled");
  if (listaTemas.firstChild.classList.contains("vacio")) {
    listaTemas.firstChild.remove();
  }
  const li = document.createElement("li");
  li.textContent = data.tema;
  listaTemas.appendChild(li);
});

socket.on("redirectPartidaAdmin", function (data) {
  window.location.href = "/api/auth/partidaAdmin/" + data.idPartida;
});

btnIniciarPartida.addEventListener("click", function () {
  var jugadores = $("#jugadores").select2("data");
  if (jugadores.length != 2) {
    alert("Debes seleccionar exactamente 2 jugadores");
    return;
  }
  let tiempoData,
    cantImagenesData,
    tipoVotoData = "";
  const jugador1 = jugadores[0].text;
  const jugador2 = jugadores[1].text;
  const tiempo = document.querySelector("input[name=tiempoJuego]:checked");
  const cantImagenes = document.querySelector(
    "input[name=cantImagenes]:checked"
  );
  const tipoVoto = document.querySelector("input[name=tipoGanador]:checked");
  if (!tiempo) {
    alert("Debes seleccionar un tiempo de juego");
    return;
  } else if (!tipoVoto) {
    alert("Debes seleccionar un tipo de ganador");
    return;
  } else if (!cantImagenes) {
    alert("Debes seleccionar una cantidad de imagenes");
    return;
  }

  tiempoData = tiempo.value;
  cantImagenesData = cantImagenes.value;
  tipoVotoData = tipoVoto.value;
  socket.emit("iniciarPartida", {
    tiempoData,
    tipoVotoData,
    jugador1,
    jugador2,
    cantImagenesData,
  });
});

//Evento para cerrar sesión
btnCerrarSesion.addEventListener("click", function () {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/";
});