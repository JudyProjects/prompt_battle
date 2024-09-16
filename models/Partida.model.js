var mongoose = require('mongoose');
var PartidaSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    jugador1: { type: String },
    jugador2: { type: String },
    tiempo: { type: Number },
    cantImagenes: { type: Number },
    tipoVoto: { type: String },
    tematica: { type: String },
    ganador: { type: String, default: null },
    imgJug1: { type: String, default: null },
    imgJug2: { type: String, default: null },
});
mongoose.model('Partida', PartidaSchema);

module.exports = mongoose.model('Partida');