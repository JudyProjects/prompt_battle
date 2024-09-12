var mongoose = require('mongoose');
var PartidaSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    jugadores: { type: String },
    configuracion: { type: String },
    ganador: { type: String },
    imagenes: { type: String }
});
mongoose.model('Partida', PartidaSchema);

module.exports = mongoose.model('Partida');