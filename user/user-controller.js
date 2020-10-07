const crypto = require('crypto');
const User = require('./user-model');
const AppError = require('../errorhandling/error-model');

const { checkUserId, createPayloadCheck, createObjectToDeliver } = require('../commons/controller-helpers');

const requiredProperties = ['username', 'password'];
// id allowed at updates
// if id is sent with a create / post request, an exception will be fired
const allowedProperties = ['id', 'username', 'password', 'firstname', 'lastname', 'state'];
const deliveredProperties = ['id', 'username', 'firstname', 'lastname', 'state'];
const checkPayloadProps = createPayloadCheck(requiredProperties, allowedProperties);

const userCtrl = {
	create: async (user) => {
		try {
			checkPayloadProps(user, 'create');

			let userWithSameName = await findByName(user.username);
			if (userWithSameName != null)
				throw new AppError(400, `Username "${user.username}" already exists.`);

			let createdUser = null;
			hashPassword(user);
			createdUser = await User.create(user);
			//createdUser.password = undefined;
			return createObjectToDeliver(createdUser, deliveredProperties);
		} catch (e) {
			throw new AppError(e);
		}
	},

	findAll: () => {
		return User.findAll({ attributes: deliveredProperties });
	},

	findById,

	findByName,

	findByState: async (state) => {
		try {
			let selectedUsers = User.findAll({
				attributes: deliveredProperties,
				where: { state },
				order: ['username']
			});
			return selectedUsers;
		} catch (e) {
			throw new AppError(e);
		}
	},

	findByCredentials: async (creds) => {
		try {
			let selectedUsers = User.findOne({
				attributes: deliveredProperties,
				where: {
					username: creds.username,
					password: creds.password
				}
			});
			return selectedUsers;
		} catch (e) {
			throw new AppError(e);
		}
	},

	update: async (id, newValues) => {
		try {
			checkUserId(id);
			checkPayloadProps(newValues, 'update');

			if (newValues.password)
				hashPassword(newValues);

			let currentUser = await findById(id);
			if (currentUser == null)
				throw new AppError(404, 'User not found');

			await currentUser.update(newValues);
			currentUser.password = undefined;
			return createObjectToDeliver(currentUser, deliveredProperties);
		} catch (e) {
			throw new AppError(e);
		}
	},

	delete: async (id) => {
		try {
			checkUserId(id);
			let currentUser = await findById(id);
			if (currentUser == null)
				throw new AppError(404, 'User not found');
			return currentUser.destroy();
		} catch (e) {
			throw new AppError(e);
		}
	},

	hashPassword
};

async function findById(id) {
	try {
		checkUserId(id);
		let user = await User.findOne({
			attributes: deliveredProperties,
			where: { id }
		});
		return user;
	} catch (e) {
		throw new AppError(e);
	}
}

async function findByName(name) {
	try {
		name = name ? name : '';
		let user = await User.findOne({
			attributes: deliveredProperties,
			where: { 'username': name }
		});
		return user;
	} catch (e) {
		throw new AppError(e);
	}
}

function hashPassword(user) {
	// todo: salt is missing
	if (user.password) {
		const hash = crypto.createHash('sha256');
		hash.update(user.password);
		user.password = hash.digest('hex');
	}
}

module.exports = userCtrl;