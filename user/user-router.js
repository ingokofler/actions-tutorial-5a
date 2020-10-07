const express = require('express');
const router = express.Router();

const { checkId, getPlainQueryString, checkQueryString } = require('../middleware/router-helpers');
const { handleAsyncError } = require('../errorhandling/error-handler');
const AppError = require('../errorhandling/error-model');

const userController = require('./user-controller');

router.post('/', handleAsyncError(async (req, res) => {
	let createdUser = await userController.create(req.body);
	res.status(201).json(createdUser);
}));

router.get('/', handleAsyncError(async function (req, res) {
	let qs = getPlainQueryString(req);

	// no query-string provided
	if (!qs) {
		return res.json(await userController.findAll());
	}

	// pattern for querystring: state XOR username (just one key allowed - otherwise throw 400
	checkQueryString(qs, /state=[^&]+$|username=[^&]+$/);

	// GET /users?state=active
	if (req.query.state) {
		return res.json(await userController.findByState(req.query.state));
	}

	// GET /users?username=kaa@htl-villach.at
	if (req.query.username) {
		let selectionResult = await userController.findByName(req.query.username);
		if (selectionResult == null) {
			throw new AppError(404, 'user not found');
		}
		return res.json(selectionResult);
	}

	// to avoid no response
	throw new AppError(500, 'unexcepted');
}));

router.get('/:id', checkId, handleAsyncError(async (req, res) => {
	let selectedUser = await userController.findById(req.params.id);
	if (selectedUser == null)
		throw new AppError(404, 'user not found');

	res.json(selectedUser);
}));

router.patch('/:id', checkId, handleAsyncError(async (req, res) => {
	let updatedUser = await userController.update(req.params.id, req.body);
	res.status(200).json(updatedUser);
}));

router.delete('/:id', checkId, handleAsyncError(async (req, res) => {
	await userController.delete(req.params.id);
	res.status(204).send();
}));

module.exports = router;