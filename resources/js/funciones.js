var mongoose = require("mongoose");
const TemaModel = require("../../models/Tema.model");
const PartidaModel = require("../../models/Partida.model");

function findOnePartida(idPartida) {
  return PartidaModel.findOne({ _id: idPartida });
}

function findPartidaVotacion() {
  return PartidaModel.find({ listaParaVotar: true });
}

async function iniciarPartida(
  jugador1,
  jugador2,
  tiempo,
  cantImagenes,
  tipoVoto,
  tematica
) {
  const partida = new PartidaModel({
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
}

async function editarPartida(
  idPartida,
  imgJug1,
  imgJug2,
  ganador,
  listaParaVotar
) {
  // Crear el objeto de actualización dinámicamente
  const updateData = {};
  if (imgJug1 !== undefined) updateData.imgJug1 = imgJug1;
  if (imgJug2 !== undefined) updateData.imgJug2 = imgJug2;
  if (ganador !== undefined) updateData.ganador = ganador;
  if (listaParaVotar !== undefined) updateData.listaParaVotar = listaParaVotar;
  // Ejecutar la actualización con los campos proporcionados
  return await PartidaModel.findByIdAndUpdate(idPartida, updateData, {
    new: true,
  });
}

async function crearTema(tema) {
  const tematica = new TemaModel({
    contenido: tema,
  });
  await tematica.save();
  return tematica;
}

function obtenerTemas() {
  return TemaModel.find({});
}

async function findTemaRandom() {
  const tema = await TemaModel.aggregate([{ $sample: { size: 1 } }]);
  return tema;
}

module.exports = {
  findTemaRandom,
  obtenerTemas,
  crearTema,
  editarPartida,
  iniciarPartida,
  findOnePartida,
  findPartidaVotacion,
};
