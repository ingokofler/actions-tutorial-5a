const Sequelize = require('sequelize');
const sequelize = require('../commons/dbConnector').getContext();

const Model = Sequelize.Model;
class User extends Model { }

User.init({
	// attributes
	id: { 
		type: Sequelize.INTEGER, 
		primaryKey: true, 
		autoIncrement: true 
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
	username: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,                
		validate: { 
			notEmpty: true
		}
	},
	password: {
		type: Sequelize.STRING,        
		allowNull: false,
		validate: { 
			notEmpty: true
		}
	},
	state: {
		type: Sequelize.STRING,
		allowNull: false, 
		validate: { 
			isIn: [['active', 'inactive']]
		}        
	}

}, {
	sequelize,
	modelName: 'user',
	options: {
	}
});


module.exports = User;