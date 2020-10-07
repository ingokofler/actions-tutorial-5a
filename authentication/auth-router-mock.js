const express = require('express');
const AppError = require('../errorhandling/error-model');
const router = express.Router();
const userRouterMock = require('../user/user-router-mock');

let tokenTable = {

};

router.post('/login', function (req, res, next) {
	try {
		if (Object.keys(req.body).length == 2) {
			let loggedInUser = userRouterMock.getUsers().filter(
				u => u.username == req.body.username && u.password == req.body.password)[0];

			if (loggedInUser) {
				let token = 'mytoken1234' + loggedInUser.username;
				tokenTable[token] = loggedInUser;
				res.send({ 'token': token });
				return;
			}
		}

		next(new AppError(401, 'login failed'));
	} catch (e) {
		next(new AppError(401, e.message));
	}
});

router.post('/logout', authenticate, function (req, res) {
	delete tokenTable[req.token];
	res.status(200).send();
});

router.get('/secret', authenticate, function (req, res) {
	res.status(200).send();
});

function authenticate(req, res, next) {
	// derzeitige Strategie: - neues model anlegen und Username mit Token merken! 
	let authUser = tokenTable[req.token];
	if (authUser) {
		req.user = authUser;
		next();
	} else {
		res.status(401).send();
	}
}

router.get('/whoIAm', authenticate, function (req, res) {
	res.status(200).send({ 'loggedInAs': req.user.username });
});

module.exports.router = router;
module.exports.authenticate = authenticate;