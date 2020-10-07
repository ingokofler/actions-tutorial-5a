const Sequelize = require('sequelize');
const sequelize = require('../commons/dbConnector').getContext();

const Model = Sequelize.Model;
const User = require('../user/user-model');
class Pupil extends Model { }

Pupil.init({
	// attributes
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	account: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: true
		}
	},
	lastname: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: true
		}
	},
	firstname: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: true
		}
	},
}, {
	sequelize,
	modelName: 'pupil'
});

// so baut man ein 1:n Verbindung mit Sequelize
Pupil.belongsTo(User, { foreignKey: { allowNull: false } });
User.hasMany(Pupil, { 'as': 'pupils' });

module.exports = Pupil;