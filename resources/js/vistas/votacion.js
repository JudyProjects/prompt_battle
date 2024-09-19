let socket = io.connect();
const id = window.location.pathname.split("/")[3];
const divInfo = document.getElementById("info");
const divError = document.getElementById("error");
const main = document.querySelector("main");
const divJugador1 = document.querySelector("div.divJugador1");
const divJugador2 = document.querySelector("div.divJugador2");
const imgJug1 = document.querySelector("img.imgJug1");
const imgJug2 = document.querySelector("img.imgJug2");
const btnVotarJug1 = document.querySelector("button#btnVotarJug1");
const btnVotarPublicoJug1 = document.querySelector(
    "button#btnVotarPublicoJug1"
);
const btnVotarJug2 = document.querySelector("button#btnVotarJug2");
const btnVotarPublicoJug2 = document.querySelector(
    "button#btnVotarPublicoJug2"
);
const btnLobby = document.querySelector("a.btnLobby");
const btnVolverAJugar = document.querySelector("button#btnVolverAJugar");
const votosJug1 = document.querySelector("div#votosJug1");
const votosJug2 = document.querySelector("div#votosJug2");
const divPostFinalizacion = document.querySelector(
    "div.divPostFinalizacion"
);
const p1 = votosJug1.querySelector("p");
const p2 = votosJug2.querySelector("p");
const timerVotacion = document.getElementById("timer");
const modalImg = document.getElementById("modal_image");
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch(`/api/datosPartida/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const responseData = await response.json();
        if (!response.ok) {
            //Cargar problema en div error
            divInfo.setAttribute("hidden", "true");
            divError.textContent = "Error al cargar la partida";
            divError.removeAttribute("hidden");
        } else if (responseData) {
            main.removeAttribute("hidden");
            //Emitir evento para cargar partida en lista partidas
            if (document.cookie.startsWith("token")) {
                //Utilizar /me2 para verificar token
                btnLobby.removeAttribute("hidden");
                if (responseData.tipoVoto != "manual") {
                    socket.emit("initVotacion", {
                        idPartida: responseData._id,
                        jugador1: responseData.jugador1,
                        jugador2: responseData.jugador2,
                    });
                    if (!responseData.ganador) {
                        timerVotacion.removeAttribute("hidden");
                        iniciarTemporizador(1);
                    }
                }
            }

            if (localStorage.getItem("aliasJugador")) {
                await socket.emit(
                    "cancelarJugador",
                    localStorage.getItem("aliasJugador")
                );
                localStorage.removeItem("aliasJugador");
                localStorage.clear();
            }

            if (!responseData.ganador) {
                if (responseData.tipoVoto == "manual") {
                    if (document.cookie.startsWith("token")) {
                        btnVotarJug1.removeAttribute("hidden");
                        btnVotarJug1.removeAttribute("disabled");
                        btnVotarJug2.removeAttribute("hidden");
                        btnVotarJug2.removeAttribute("disabled");
                    }
                    votosJug1.setAttribute("hidden", "true");
                    votosJug1.classList.remove("d-inline-grid");
                    votosJug2.setAttribute("hidden", "true");
                    votosJug2.classList.remove("d-inline-grid");
                } else {

                    btnVotarPublicoJug1.removeAttribute("hidden");
                    btnVotarPublicoJug1.removeAttribute("disabled");
                    btnVotarPublicoJug2.removeAttribute("hidden");
                    btnVotarPublicoJug2.removeAttribute("disabled");
                }
            } else {
                divPostFinalizacion.removeAttribute("hidden");
                if (responseData.ganador != "empate") {
                    divPostFinalizacion.querySelector(
                        "div.divGanador"
                    ).textContent = `El ganador es: ${responseData.ganador}`;
                    if (responseData.ganador == responseData.jugador1) {
                        imgJug1.classList.add("ganador");
                    } else {
                        imgJug2.classList.add("ganador");
                    }
                } else {
                    divPostFinalizacion.querySelector(
                        "div.divGanador"
                    ).textContent = "¡Empate!";
                }
                votosJug1.setAttribute("hidden", "true");
                votosJug1.classList.remove("d-inline-grid");
                votosJug2.setAttribute("hidden", "true");
                votosJug2.classList.remove("d-inline-grid");
            }
            let hJug1 = document.createElement("h4");
            let hJug2 = document.createElement("h4");
            hJug1.textContent = responseData.jugador1;
            divJugador1.appendChild(hJug1);
            hJug2.textContent = responseData.jugador2;
            divJugador2.appendChild(hJug2);
            if (responseData.imgJug1) {
                imgJug1.setAttribute("src", `${responseData.imgJug1}`);

                imgJug1.onerror = () => {
                    const urlCambiar1 = imgJug1.getAttribute("src");
                    imgJug1.setAttribute('src', '');
                    imgJug1.setAttribute('src', urlCambiar1);
                };
            }
            if (responseData.imgJug2) {
                imgJug2.setAttribute("src", `${responseData.imgJug2}`);

                imgJug2.onerror = () => {
                    const urlCambiar2 = imgJug2.getAttribute("src");
                    imgJug2.setAttribute('src', '');
                    imgJug2.setAttribute('src', urlCambiar2);
                };
            }
            socket.emit('obtenerVotos', id);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
});
document.addEventListener("click", function (evt) {
    if (evt.target.id == "btnVolverAJugar") {
        window.location.href = "/";
    }

    if (evt.target.id == "btnVotarJug1") {
        imgJug1.classList.add("ganador");
        socket.emit("ganadorVotacion", {
            idPartida: id,
            ganador: divJugador1.children[0].textContent,
        });
    } else if (evt.target.id == "btnVotarJug2") {
        imgJug2.classList.add("ganador");
        socket.emit("ganadorVotacion", {
            idPartida: id,
            ganador: divJugador2.children[0].textContent,
        });
    } else if (evt.target.id == "btnVotarPublicoJug1") {
        btnVotarPublicoJug1.setAttribute("disabled", "true");
        btnVotarPublicoJug1.textContent = "✔";
        btnVotarPublicoJug2.setAttribute("disabled", "true");
        btnVotarPublicoJug2.textContent = "❌";
        socket.emit("sumarVoto", { idPartida: id, jugadorAvotar: 1 });
    } else if (evt.target.id == "btnVotarPublicoJug2") {
        btnVotarPublicoJug1.setAttribute("disabled", "true");
        btnVotarPublicoJug1.textContent = "❌";
        btnVotarPublicoJug2.setAttribute("disabled", "true");
        btnVotarPublicoJug2.textContent = "✔";
        socket.emit("sumarVoto", { idPartida: id, jugadorAvotar: 2 });
    }
});

socket.on("actualizarVotos", function (data) {
    if (data.idPartida == id) {
        p1.innerText = data.votacion.jugador1;
        p2.innerText = data.votacion.jugador2;
    }
});

socket.on("iniciarVotacion", function (data) {
    if (data == id) {
        btnVotarPublicoJug1.removeAttribute("hidden");
        btnVotarPublicoJug1.removeAttribute("disabled");
        btnVotarPublicoJug2.removeAttribute("hidden");
        btnVotarPublicoJug2.removeAttribute("disabled");
    }
});

socket.on("finalizarVotacion", function (data) {
    if (data.idPartida == id) {
        divPostFinalizacion.removeAttribute("hidden");
        if (data.ganador == "empate") {
            divPostFinalizacion.querySelector("div.divGanador").textContent =
                "¡Empate!";
        } else {
            divPostFinalizacion.querySelector(
                "div.divGanador"
            ).textContent = `El ganador es: ${data.ganador}`;
            if (data.ganador == divJugador1.children[0].textContent) {
                imgJug1.classList.add("ganador");
            } else {
                imgJug2.classList.add("ganador");
            }
        }
        btnVotarJug1.setAttribute("hidden", "true");
        btnVotarJug1.setAttribute("disabled", "true");
        btnVotarJug2.setAttribute("hidden", "true");
        btnVotarJug2.setAttribute("disabled", "true");
        btnVotarPublicoJug1.setAttribute("hidden", "true");
        btnVotarPublicoJug1.setAttribute("disabled", "true");
        btnVotarPublicoJug2.setAttribute("hidden", "true");
        btnVotarPublicoJug2.setAttribute("hidden", "true");
        timerVotacion.setAttribute("hidden", "true");
        if (!data.votacion) {
            votosJug1.setAttribute("hidden", "true");
            votosJug1.classList.remove("d-inline-grid");
            votosJug2.setAttribute("hidden", "true");
            votosJug2.classList.remove("d-inline-grid");
        }
    }
});

imgJug1.addEventListener("click", function () {
    modalImg.setAttribute("src", imgJug1.getAttribute("src"));
});

imgJug2.addEventListener("click", function () {
    modalImg.setAttribute("src", imgJug2.getAttribute("src"));
});