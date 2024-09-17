var mongoose = require("mongoose");
const TemaModel = require("../../models/Tema.model");
const PartidaModel = require("../models/Partida.model");

module.exports = function findOnePartida(idPartida) {
  return PartidaModel.findOne({ _id: idPartida });
};

module.exports = function findPartidaVotacion() {
  return PartidaModel.find({ listaParaVotar: true });
};

module.exports = async function iniciarPartida(
  jugador1,
  jugador2,
  tiempo,
  cantImagenes,
  tipoVoto,
  tematica
) {
  const partida = new Partida({
    _id: new mongoose.Types.ObjectId(),
    jugador1: jugador1,
    jugador2: jugador2,
    tiempo: tiempo,
    cantImagenes: cantImagenes,
    tipoVoto: tipoVoto,
    tematica: tematica,
  });
  await partida.save();
  return partida;
};

module.exports = function editarPartida(
  idPartida,
  imgJug1,
  imgJug2,
  ganador,
  listaParaVotar
) {
  PartidaModel.findByIdAndUpdate(idPartida, {
    imgJug1: imgJug1,
    imgJug2: imgJug2,
    ganador: ganador,
    listaParaVotar: listaParaVotar,
  });
};

module.exports = async function crearTema(tema) {
  const tematica = new TemaModel({
    contenido: tema,
  });
  await tematica.save();
};

module.exports = function obtenerTemas() {
  return TemaModel.find({});
};

module.exports = async function findTemaRandom() {
  const tema = await TemaModel.aggregate([{ $sample: { size: 1 } }]);
  return tema;
};
