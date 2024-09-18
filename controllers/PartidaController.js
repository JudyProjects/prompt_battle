var express = require("express");
var router = express.Router();
const path = require("path");
const funciones = require("../resources/js/funciones.js");
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/partida/:id", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "../views/partida.html"));
});

router.get("/listadoPartida", function (req, res) {
  res
    .status(200)
    .sendFile(path.join(__dirname, "../views/listadoPartida.html"));
});

router.get("/votacion/:id", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "../views/votacion.html"));
});

router.get("/datosPartida/:id", async function (req, res) {
  try {
    const partida = await funciones.findOnePartida(req.params.id);
    res.status(200).json(partida);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/obtenerPartidasVotacion", async function (req, res) {
  try {
    const partidas = await funciones.findPartidaVotacion();
    res.status(200).json(partidas);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/editarPartida/:id", async function (req, res) {
  try {
    console.log(req.body);
    const partida = await funciones.editarPartida(
      req.params.id,
      req.body.imgJug1,
      req.body.imgJug2,
      req.body.ganador,
      req.body.listaParaVotar
    );
    res.status(200).json(partida);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
