var app = require('./app');
var port = process.env.PORT;

var server = app.listen(port, function() {
  console.log('Servidor funcionando en port: ' + port);
});