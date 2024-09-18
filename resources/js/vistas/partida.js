var socket = io.connect();
var llamadas = 0;
const btnGenerar = document.getElementById("btnGenerar");
const btnResultado = document.getElementById("btnResultado");
const divImagenes = document.getElementById("divImagenesGeneradas");
const btnVolver = document.getElementById("btnVolver");
const tematicaElegida = document.getElementById("tematicaElegida");
const textArea = document.querySelector("textarea");
const id = window.location.pathname.split("/")[3];
const divInfo = document.getElementById("info");
const divError = document.getElementById("error");
const main = document.querySelector("main");

btnGenerar.addEventListener("click", () => {
  var prompt = document.getElementById("floatingTextarea").value;
  let imagenesEnviar = [];
  if (llamadas < 2) {
    if (prompt === undefined || prompt.trim() == "") {
      alert("Por favor, introduce un texto para generar la imagen.");
      return;
    }
    var urls = generarImagenes(prompt, cantImagenes);
    llamadas++;
    socket.emit("jugadorImagenes", {
      idPartida: id,
      aliasJugador: localStorage.getItem("aliasJugador"),
      imagenes: urls,
    });

    //Crea cada imagen
    urls.forEach((url, index) => {
      const divImagen = document.createElement("div");
      divImagen.classList.add("image-container");

      const loader = document.createElement("div");
      loader.classList.add("loader");
      divImagen.appendChild(loader);

      const nuevaImagen = document.createElement("img");
      nuevaImagen.src = url;
      nuevaImagen.onclick = function () {
        if (nuevaImagen.classList.contains("seleccionada")) {
          nuevaImagen.classList.remove("seleccionada");
          btnResultado.setAttribute("disabled", "disabled");
          return;
        }
        divImagenes.childNodes.forEach((div) => {
          if (div.nodeName == "DIV") {
            if (div.children[1].classList.contains("seleccionada")) {
              div.children[1].classList.remove("seleccionada");
              return;
            }
          }
        });
        nuevaImagen.classList.add("seleccionada");
        btnResultado.removeAttribute("disabled");
      };
      nuevaImagen.classList.add("imagenesGeneradas");

      nuevaImagen.onload = () => {
        loader.style.display = "none";
        nuevaImagen.style.display = "block";
      };

      divImagen.appendChild(nuevaImagen);
      divImagenes.appendChild(divImagen);
    });
  } else {
    alert("Has alcanzado el límite de llamadas permitidas.");
  }
});

// T lleva al index
btnVolver.addEventListener("click", function () {
  window.location.href = "/";
});

// Setea la imagen que se usará
btnResultado.addEventListener("click", function () {
  const img = document.querySelector("img.seleccionada");
  if (btnResultado.classList.contains("resultadoActivo")) {
    img.classList.remove("elegida");
    btnResultado.textContent = "Elegir imagen";
    btnResultado.classList.remove("resultadoActivo");
    return;
  }
  if (img) {
    img.classList.add("elegida");
    btnResultado.textContent = "Cancelar selección";
    btnResultado.classList.add("resultadoActivo");
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const id = window.location.pathname.split("/")[3];
    const response = await fetch(
      "/api/datosPartida/" + id,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const responseData = await response.json();
    if (!response.ok) {
      divError.textContent = "Ha surgido un problema con la partida";
      divError.removeAttribute("hidden");
      divInfo.setAttribute("hidden", "true");
    }
    if (responseData) {
      //Cargar temporizador
      iniciarTemporizador(responseData.tiempo);
      //Cargar tematica
      tematicaElegida.textContent = responseData.tematica;
      //Cargar cant imagenes a generar
      cantImagenes = responseData.cantImagenes;
      divInfo.setAttribute("hidden", "true");
      main.removeAttribute("hidden");
    }
  } catch (error) {
    console.error(error);
  }
});

textArea.addEventListener("keyup", function () {
  socket.emit("jugadorEscribe", {
    idPartida: id,
    aliasJugador: localStorage.getItem("aliasJugador"),
    text: textArea.value,
  });
});

// Selecciona la imagen elegida y la envía al socket para subir a BD
socket.on("finalizarPartida", function (data) {
  //obtener imagen seleccionada
  const id = window.location.pathname.split("/")[3];
  if (data.idPartida == id) {
    const imgSeleccionada = document.querySelector("img.elegida");
    let valorEnviar;
    if (imgSeleccionada) {
      valorEnviar = imgSeleccionada.getAttribute("src");
    }
    socket.emit("jugadorFinalizaPartida", {
      idPartida: id,
      valorEnviado: valorEnviar,
      jugadorQueEnvia: localStorage.getItem("aliasJugador"),
    });
  }
});

socket.on("redirectAvotacion", function (data) {
  if (
    data.idPartida == id &&
    data.jugador == localStorage.getItem("aliasJugador")
  ) {
    localStorage.removeItem("aliasJugador");
    localStorage.clear();
    window.location.href = `/api/votacion/${id}`;
  }
});