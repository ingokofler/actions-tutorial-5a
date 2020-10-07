const Pupil = require('./pupil-model');
const AppError = require('../errorhandling/error-model');

const { checkUserId, createPayloadCheck, createObjectToDeliver } = require('../commons/controller-helpers');

const requiredProperties = ['account', 'firstname', 'lastname'];
const allowedProperties = ['id', 'account', 'firstname', 'lastname'];
const deliveredProperties = ['id', 'account', 'firstname', 'lastname'];
const checkPayloadProps = createPayloadCheck(requiredProperties, allowedProperties);

const userCtrl = {
	create: async (userId, pupil) => {
		try {
			checkUserId(userId);
			checkPayloadProps(pupil, 'create');

			pupil.userId = userId;
			let anotherPupilWithThatAccount = await Pupil.findAll({
				where: {
					userId: pupil.userId,
					account: pupil.account
				}
			});

			if (anotherPupilWithThatAccount.length > 0)
				throw new AppError(400, 'pupil with this account already exists. use patch to update the pupil');

			let createdPupil = null;
			createdPupil = await Pupil.create(pupil);

			return createObjectToDeliver(createdPupil, deliveredProperties);
		} catch (e) {
			throw new AppError(e);
		}
	},

	findAll: (userId) => {
		try {
			checkUserId(userId);
			return Pupil.findAll({
				attributes: deliveredProperties,
				where: { userId }
			});
		} catch (e) {
			throw new AppError(e);
		}
	},

	findById,

	update: async (userId, id, newValues) => {
		try {
			checkUserId(id);
			checkPayloadProps(newValues, 'update');

			let currentPupil = await findById(userId, id);
			if (currentPupil == null)
				throw new AppError(404, 'Pupil not found');

			await currentPupil.update(newValues);
			return createObjectToDeliver(currentPupil, deliveredProperties);
		} catch (e) {
			throw new AppError(e);
		}
	},

	delete: async (userId, id) => {
		try {
			checkUserId(userId);
			// todo:
			// delete assignments for this pupil to all ous 
			// delete all records before
			let pupilToDelete = await Pupil.findOne({
				where: { id, userId }
			});

			if (pupilToDelete == null)
				throw new AppError(404, 'pupil with this id does not exists');

			return pupilToDelete.destroy();
		} catch (e) {
			throw new AppError(e);
		}
	}
};

async function findById(userId, id) {
	try {
		checkUserId(userId);
		let pupil = await Pupil.findOne({
			attributes: deliveredProperties,
			where: { id, userId }
		});
		return pupil;

	} catch (e) {
		throw new AppError(e);
	}
}

module.exports = userCtrl;