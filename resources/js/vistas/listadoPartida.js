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
        divLi.classList.add(
          "d-flex",
          "justify-content-around",
          "align-items-center",
          "p-2"
        );
        divLi.innerHTML = `
                <p>${partida.jugador1}</p>
                <p>VS</p>
                <p>${partida.jugador2}</p>`;
        const aVotar = document.createElement("a");
        const btnVotar = document.createElement("button");
        btnVotar.textContent = "Votar";
        btnVotar.classList.add("btn", "btn-outline-light");
        aVotar.setAttribute("href", "/api/votacion/" + partida._id);
        aVotar.classList.add("w-25");
        aVotar.appendChild(btnVotar);
        divLi.appendChild(aVotar);
        listadoPartida.appendChild(divLi);
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
    divLi.classList.add(
      "d-flex",
      "justify-content-around",
      "align-items-center",
      "p-2"
    );
    divLi.innerHTML = `
            <p>${data.jugador1}</p>
            <p>VS</p>
            <p>${data.jugador2}</p>`;
    const aVotar = document.createElement("a");
    const btnVotar = document.createElement("button");
    btnVotar.textContent = "Votar";
    btnVotar.classList.add("btn", "btn-outline-light");
    aVotar.setAttribute("href", "/api/votacion/" + data.idPartida);
    aVotar.classList.add("w-25");
    aVotar.appendChild(btnVotar);
    divLi.appendChild(aVotar);
    listadoPartida.appendChild(divLi);
  } catch (error) {
    console.error(error.message);
  }
});
