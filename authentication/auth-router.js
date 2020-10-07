const express = require('express');
const AppError = require('../errorhandling/error-model');

const router = express.Router();
const userController = require('../user/user-controller');

const crypto = require('crypto');
const algorithm = 'aes-192-cbc';
const serverPK = require('../certs/serverSecret').PrivateKey;
const serverSalt = require('../certs/serverSecret').Salt;

const { Buffer } = require('buffer');
const key = crypto.scryptSync(serverPK, serverSalt, 24);
const iv = Buffer.alloc(16, 0);

router.post('/login', async (req, res, next) => {
	try {
		if (Object.keys(req.body).length == 2) {
			userController.hashPassword(req.body);
			let loggedInUser = await userController.findByCredentials(req.body);
			if (loggedInUser) {
				// angelehnt an einen JWT 
				// aber noch mit einem Token, der nur vom Server gelesen werden kann 
				// der Rest wird "mitgesendet" damit der Client keinen zweiten Request 
				// machen muss - es dürfen in den Daten keine "Geheimnisse" enthalten sein                
				let token = generateToken(loggedInUser);
				let authenticationInformation = {
					'token': token,
					'information': {
						'iss': 'APPSERVER',
						'sub': loggedInUser.id,
						'exp': 'not set for the client',
						'user': {
							'username': loggedInUser.username,
							'firstname': loggedInUser.firstname,
							'lastname': loggedInUser.lastname,
						}
					}
				};
				res.send(authenticationInformation);
				return;
			}
		}

		next(new AppError(401, 'login failed'));
	} catch (e) {
		next(new AppError(401, e.message));
	}
});

router.post('/logout', authenticate, function (req, res) {
	res.status(200).send();
});

router.get('/secret', authenticate, function (req, res) {
	res.status(200).send('secret is here');
});

router.get('/whoIAm', authenticate, function (req, res) {
	res.status(200).send({ 'loggedInAs': req.user.username });
});

function authenticate(req, res, next) {
	if (req.token) {
		try {
			let decryptedToken = decryptToken(req.token);
			// check if token is expired 
			//let currentTimeStamp = Date.now();        
			//if (currentTimeStamp - decryptedToken.timestamp <= 10 * 1000) {
			req.user = {
				id: decryptedToken.userId,
				username: decryptedToken.username
			};
			next();
			return;
			//}  
		} catch (err) {
			// silent error handling 
			// maybe a logger could log failing login attempts 
			// console.log('authentication failed - token parsing error ' + err);
		}
	}

	next(new AppError(401, 'login failed'));
}

function generateToken(loggedInUser) {
	let token = JSON.stringify({
		userId: loggedInUser.id,
		username: loggedInUser.username,
		exp: Date.now() + 30 * 60 * 1000   // 30 minuten timeout
	});

	const cipher = crypto.createCipheriv(algorithm, key, iv);
	token = cipher.update(token, 'utf8', 'hex');
	token += cipher.final('hex');

	return token;
}

function decryptToken(encryptedToken) {
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decryptedToken = decipher.update(encryptedToken, 'hex', 'utf8');
	decryptedToken += decipher.final('utf8');
	decryptedToken = JSON.parse(decryptedToken);
	return decryptedToken;
}

module.exports.router = router;
module.exports.authenticate = authenticate;