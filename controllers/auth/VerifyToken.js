var jwt = require('jsonwebtoken');
var config = require('../../config');
function verifyToken(req, res, next) {
	var token = req.cookies.token;
	if (!token)
		return res.status(403).send({ auth: false, message: 'Sin token.'});
	jwt.verify(token, config.secret, function(err, decoded) {
		if (err)
		return res.status(500).send({ auth: false, message: 'Error al autenticar token' });
		req.userId = decoded.id;
		next();
	});
}
module.exports = verifyToken;