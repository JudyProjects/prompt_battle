var socket = io.connect();
const listadoPartida = document.querySelector(".listadoPartida");
const btnVolverAJugar = document.getElementById("btnVolverAJugar");

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch(
      "/api/obtenerPartidasVotacion"
    );
    const responseData = await response.json();
    if (!response.ok) {
      console.log("error en response");
    }
    if (responseData) {
      responseData.forEach((partida) => {
        const divLi = document.createElement("div");
        const divJugadores = document.createElement("div");
        const divBoton = document.createElement("div");
        const divFila = document.createElement("div");
        divJugadores.classList.add("divJugadores");
        divBoton.classList.add("divbtnVotar");
        divFila.classList.add("row");
        divFila.classList.add("my-3");
        divLi.classList.add(
          "d-flex",
          "justify-content-around",
          "align-items-center",
          "p-2"
        );
        divLi.innerHTML = `
                <p class="parrafos">${partida.jugador1}</p>
                <p class="parrafos">VS</p>
                <p class="parrafos">${partida.jugador2}</p>`;
        divLi.classList.add("alineacionFilas");
        const aVotar = document.createElement("a");
        const btnVotar = document.createElement("button");
        btnVotar.textContent = "Votar";
        btnVotar.classList.add("btn", "btn-outline-light");
        aVotar.setAttribute("href", "/api/votacion/" + partida._id);
        aVotar.classList.add("w-50");
        aVotar.appendChild(btnVotar);
        divBoton.appendChild(aVotar);
        divJugadores.appendChild(divLi);
        divFila.appendChild(divJugadores);
        divFila.appendChild(divBoton);
        listadoPartida.appendChild(divFila);
      });
    }
  } catch (error) {
    console.error(error.message);
  }
});

btnVolverAJugar.addEventListener("click", function () {
  window.location.href = "/";
});

socket.on("nuevaVotacion", function (data) {
  console.log(data);
  try {
    const divLi = document.createElement("div");
    const divJugadores = document.createElement("div");
    const divBoton = document.createElement("div");
    const divFila = document.createElement("div");
    divJugadores.classList.add("divJugadores");
    divBoton.classList.add("divbtnVotar");
    divFila.classList.add("row");
    divFila.classList.add("my-3");
    divLi.classList.add(
      "d-flex",
      "justify-content-around",
      "align-items-center",
      "p-2"
    );
    divLi.innerHTML = `
                <p class="parrafos">${data.jugador1}</p>
                <p class="parrafos">VS</p>
                <p class="parrafos">${data.jugador2}</p>`;
    divLi.classList.add("alineacionFilas");
    const aVotar = document.createElement("a");
    const btnVotar = document.createElement("button");
    btnVotar.textContent = "Votar";
    btnVotar.classList.add("btn", "btn-outline-light");
    aVotar.setAttribute("href", "/api/votacion/" + data.idPartida);
    aVotar.classList.add("w-50");
    aVotar.appendChild(btnVotar);
    divBoton.appendChild(aVotar);
    divJugadores.appendChild(divLi);
    divFila.appendChild(divJugadores);
    divFila.appendChild(divBoton);
    listadoPartida.appendChild(divFila);
  } catch (error) {
    console.error(error.message);
  }
});
