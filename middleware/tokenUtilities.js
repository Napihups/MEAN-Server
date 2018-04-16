module.exports = () => {

	var module = {};
	const jwt = require('jsonwebtoken');
	const config = require('../config/database');


	module.getUserIdFromToken = (token) => {
		const decoded = jwt.verify(token, config.secret);
		return decoded.id;
	}

	module.getUsernameFromToken = (token) => {
		const decoded = jwt.verify(token, config.secret);
		return decoded.username;
	}

	module.getUsernameFromReq = (req) => {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, config.secret);
		return decoded.username;
	}

	return module;
}