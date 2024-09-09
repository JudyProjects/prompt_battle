var obj = require('./app');
var port = process.env.PORT;

var server = obj.server.listen(port, function() {
  console.log('Servidor funcionando en port: ' + port);
});