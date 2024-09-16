var express = require('express');
var router = express.Router();
const path = require('path');

router.get('/partida', function (req, res) {
	res.status(200).sendFile(path.join(__dirname, '../views/partida.html'));
});

router.get('/listadoPartida', function (req, res) {
	res.status(200).sendFile(path.join(__dirname, '../views/listadoPartida.html'));
});

router.get('/votacion', function (req, res) {
	res.status(200).sendFile(path.join(__dirname, '../views/votacion.html'));
});
module.exports = router;