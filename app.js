var express = require('express');
var app = express();
const path = require('path');
var db = require('./db');
global.__root   = __dirname + '/'; 

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
/*
Pegar en header de HTML lo siguiente para utilizar el Bootstrap
  <link rel="stylesheet" href="./css/bootstrap.min.css">
*/

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var AuthController = require('./auth/AuthController');
app.use('/api/auth', AuthController);


module.exports = app;