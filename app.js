var express = require('express');
var app = express();
const path = require('path');
var db = require('./db');
global.__root   = __dirname + '/'; 

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));
/*
Pegar en header de HTML lo siguiente para utilizar el Bootstrap
  <link rel="stylesheet" href="/css/bootstrap.min.css">
*/

app.get('/', function (req, res) {
  res.status(200).sendFile(path.join(__dirname, '/views/index.html'));
});

var AuthController = require('./auth/AuthController');
app.use('/api/auth', AuthController);


module.exports = app;