const config = require('../environments/configLoader').get();

module.exports.enable = (req, res, next) => {
	res.setHeader(
		'Access-Control-Allow-Origin',
		config.security.cors.allowedOrigin,
	);
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, POST, DELETE');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization',
	);

	if (req.method == 'OPTIONS') res.status(200).send();
	else next();
};
