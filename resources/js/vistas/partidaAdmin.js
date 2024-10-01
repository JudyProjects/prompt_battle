var socket = io.connect();
const id = window.location.pathname.split("/")[4];
const divInfo = document.getElementById("info");
const divError = document.getElementById("error");
const main = document.querySelector("main");
const tematica = document.querySelector(".tematicaActual");
const timer = document.querySelector("#timer");
const config = document.querySelector(".config");
const aliasJug1 = document.querySelector(".aliasJug1");
const aliasJug2 = document.querySelector(".aliasJug2");
const input1 = document.getElementById("input1");
const input2 = document.getElementById("input2");
const divImgGeneradasJug1 = document.querySelector(".divImgGeneradasJug1");
const divImgGeneradasJug2 = document.querySelector(".divImgGeneradasJug2");
const modalImg = document.getElementById("modal_image");
let cantImagenes;
document.addEventListener("DOMContentLoaded", async function () {
  try {
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
      //Cargar problema en div error
      divInfo.setAttribute("hidden", "true");
      divError.textContent = "Error al cargar la partida";
      divError.removeAttribute("hidden");
    } else if (responseData) {
      // Si trae datos, envía admin listo y carga los datos
      socket.emit("adminListo", {
        idPartida: responseData._id,
        jugadores: {
          jugador1: responseData.jugador1,
          jugador2: responseData.jugador2,
        },
        tiempo: responseData.tiempo,
        tipoVoto: responseData.tipoVoto,
      });
      //Cargar datos en main
      divInfo.setAttribute("hidden", "true");
      tematica.textContent = responseData.tematica;
      iniciarTemporizador(responseData.tiempo);
      config.children[0].innerHTML += responseData.cantImagenes;
      cantImagenes = responseData.cantImagenes;
      config.children[1].innerHTML += responseData.tipoVoto;
      aliasJug1.textContent = responseData.jugador1;
      aliasJug2.textContent = responseData.jugador2;
      main.removeAttribute("hidden");
    }
  } catch (error) {
    console.error(error);
  }
});

// Cuando escribe en input, se envía a la pantalla admin
socket.on("jugador-writing", function (data) {
  if (data.idPartida == id) {
    if (data.aliasJug == aliasJug1.textContent) {
      input1.textContent = data.text;
    } else {
      input2.textContent = data.text;
    }
  }
});

// Mismo que arriba pero con imágenes
socket.on("jugador-imagenes", function (data) {
  if (data.idPartida == id) {
    let divImagenes =
      data.aliasJug == aliasJug1.textContent
        ? document.querySelector(".divImgGeneradasJug1")
        : document.querySelector(".divImgGeneradasJug2");
    if (divImagenes.children.length < cantImagenes * 2) {
      data.imagenes.forEach((url, index) => {
        const divImagen = document.createElement("div");
        divImagen.classList.add("image-container");

        const loader = document.createElement("div");
        loader.classList.add("loader");
        divImagen.appendChild(loader);

        const nuevaImagen = document.createElement("img");
        nuevaImagen.src = url;
        nuevaImagen.classList.add("imagesGeneradas");
        nuevaImagen.setAttribute("data-bs-toggle", "modal");
        nuevaImagen.setAttribute("data-bs-target", "#modalImagen");
        nuevaImagen.setAttribute("role", "button");
        nuevaImagen.onclick = () => {
          //Setear src a img en model
          modalImg.setAttribute("src", url);
        }

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
    }
  }
});

// Cuando se termina la partida, se redirecciona a la pantalla de votación
socket.on("finalizarPartida", function (dato) {
  if (id == dato.idPartida) {
    window.location.href = `/api/votacion/${dato.idPartida}`;
  }
});