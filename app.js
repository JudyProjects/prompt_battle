var express = require('express');
var app = express();
const path = require('path');
var router = express.Router();
var db = require('./db');
var cookieParser = require('cookie-parser');
global.__root = __dirname + '/';
var server = require("http").createServer(app);
var session = require("express-session");
var sharedsession = require("express-socket.io-session");

var io = require("socket.io")(server);

var FileStore = require("session-file-store")(session);
var fileStoreOptions = {};

var sessionMiddleware = session({
  store: new FileStore(fileStoreOptions),
  secret: "ultrasecreto",
  resave: true,
  saveUninitialized: true,
});

router.use(sessionMiddleware);
io.use(sharedsession(sessionMiddleware));

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use(cookieParser());
app.use('/socket', express.static(path.join(__dirname, 'node_modules/socket.io')));

io.sockets.on('connection', function (socket) {
  var llamadas = 0;

  if (!socket.handshake.session.user) {
    var user = addUser();
    console.log(user, 'conectado');
    socket.handshake.session.user = user;
    socket.handshake.session.save();
  } else {
    var user = socket.handshake.session.user;
    console.log(user, 'Ingresó');
  }

  socket.on('disconnect', function () {
    console.log('Un cliente se ha desconectado');
  });

  socket.on('generarImagenIA', function (data) {
    var prompt = data.prompt;
    var promptCodificado = encodeURIComponent(prompt);
    var url = `https://image.pollinations.ai/prompt/${promptCodificado}?nologo=true&enhance=true&seed=1`;
    var url2 = `https://image.pollinations.ai/prompt/${promptCodificado}?nologo=true&enhance=true&seed=2`;
    llamadas++;
    io.sockets.emit("URLarmada", {
      url: url, url2: url2, llamadas: llamadas
    });
  });

  socket.on('nueva_defensa', function (defensa) {
    io.emit('defensa_recibida', defensa);
  });
});

var addUser = function () {
  var user = {
    name: 'Alias'
  };
  return user;
};

app.get('/', function (req, res) {
  res.status(200).sendFile(path.join(__dirname, '/views/index.html'));
});

var AuthController = require('./controllers/auth/AuthController');
app.use('/api/auth', AuthController);

var PartidaController = require('./controllers/PartidaController');
app.use('/api', PartidaController);


module.exports = server;