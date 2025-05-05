require('dotenv').config();
var obj = require('./app');
var port = process.env.PORT || 1234;

var server = obj.server.listen(port, function() {
  console.log('Servidor funcionando en port: ' + port);
});