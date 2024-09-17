var express = require('express');
var router = express.Router();
const path = require('path');
const PartidaModel = require('../models/Partida.model');
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/partida/:id', function (req, res) {
	res.status(200).sendFile(path.join(__dirname, '../views/partida.html'));
});

router.get('/listadoPartida', function (req, res) {
	res.status(200).sendFile(path.join(__dirname, '../views/listadoPartida.html'));
});

router.get('/votacion/:id', function (req, res) {
	res.status(200).sendFile(path.join(__dirname, '../views/votacion.html'));
});

router.get('/datosPartida/:id', async function (req, res) {
	try {
		const partida = await PartidaModel.findOne({ _id: req.params.id });
		res.status(200).json(partida);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/obtenerPartidasVotacion', async function (req, res) {
	try {
		const partidas = await PartidaModel.find({ listaParaVotar: true});
		res.status(200).json(partidas);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.put('/editarPartida/:id', async function (req, res) {
	try {
		const partida = await PartidaModel.findByIdAndUpdate(req.params.id, {
			imgJug1: req.body.imgJug1,
			imgJug2: req.body.imgJug2,
			ganador: req.body.ganador,
			listaParaVotar: req.body.listaParaVotar
		});
		res.status(200).json(partida);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;