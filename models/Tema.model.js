var mongoose = require('mongoose');
var TemaSchema = new mongoose.Schema({
    contenido: {
        type: String,
        unique: true,
        max: 50
    }
});
mongoose.model('Tema', TemaSchema);

module.exports = mongoose.model('Tema');