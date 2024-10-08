let socket = io.connect();
let llamadas = 0;
let llamadasRestantes = 2;
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
const cantLlamadas = document.querySelector('p.cantLlamadas');
let cantImagenes = 0;

btnGenerar.addEventListener("click", async function() {
  let prompt = document.getElementById("floatingTextarea").value;
  if (llamadas < 2) {
    if (prompt === undefined || prompt.trim() == "") {
      alert("Por favor, introduce un texto para generar la imagen.");
      return;
    }
    let urls = generarImagenes(prompt, cantImagenes);
    llamadas++;
    if (llamadas == 2) {
      btnGenerar.setAttribute("disabled", "disabled");
    }
    cantLlamadas.textContent = `Prompts restantes: ${--llamadasRestantes}`;
    
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
          btnResultado.classList.remove("btn-light");
          btnResultado.classList.add("btn-outline-light");
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
        btnResultado.classList.remove("btn-outline-light");
        btnResultado.classList.add("btn-light");
      };
      nuevaImagen.classList.add("imagenesGeneradas");

      nuevaImagen.onload = () => {
        loader.style.display = "none";
        nuevaImagen.style.display = "block";
      };

      nuevaImagen.onerror = () => {
        const urlCambiar = nuevaImagen.getAttribute("src");
        nuevaImagen.setAttribute('src', '');
        nuevaImagen.setAttribute('src', urlCambiar);
      };
      
      divImagen.appendChild(nuevaImagen);
      divImagenes.appendChild(divImagen);
    });
    socket.emit("jugadorImagenes", {
      idPartida: id,
      aliasJugador: localStorage.getItem("aliasJugador"),
      imagenes: urls,
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
    window.location.href = `/api/votacion/${id}`;
  }
});