var express = require('express');
var app = express();
const path = require('path');
var db = require('./db');
var cookieParser = require('cookie-parser');
global.__root = __dirname + '/';
var server = require("http").createServer(app);

var io = require("socket.io")(server);

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use(cookieParser());
app.use('/socket', express.static(path.join(__dirname, 'node_modules/socket.io')));

app.get('/', function (req, res) {
  res.status(200).sendFile(path.join(__dirname, '/views/index.html'));
});

var AuthController = require('./controllers/auth/AuthController');
app.use('/api/auth', AuthController);

var PartidaController = require('./controllers/PartidaController');
app.use('/api', PartidaController);


module.exports = { server, express };
var socket = require('./socket.js');