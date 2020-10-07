const express = require('express');
const router = express.Router();

const { checkId } = require('../middleware/router-helpers');
const { handleAsyncError } = require('../errorhandling/error-handler');
const AppError = require('../errorhandling/error-model');

const pupilController = require('./pupil-controller');

router.post('/', handleAsyncError(async (req, res) => {
	let createdPupil = await pupilController.create(req.user.id, req.body);
	res.status(201).json(createdPupil);
}));

router.get('/', handleAsyncError(async function (req, res) {
	let allPupils = await pupilController.findAll(req.user.id);
	res.json(allPupils);
}));

router.get('/:id', checkId, handleAsyncError(async (req, res) => {
	let selectedPupil = await pupilController.findById(req.user.id, req.params.id);
	if (selectedPupil == null)
		throw new AppError(404, 'Pupil not found');

	res.json(selectedPupil);
}));

router.patch('/:id', checkId, handleAsyncError(async (req, res) => {
	let updatedPupil = await pupilController.update(req.user.id, req.params.id, req.body);
	res.status(200).json(updatedPupil);
}));

router.delete('/:id', checkId, handleAsyncError(async (req, res) => {
	await pupilController.delete(req.user.id, req.params.id);
	res.status(204).send();
}));

module.exports = router;
