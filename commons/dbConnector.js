const Sequelize = require('sequelize');
//const config = require('../environments/configLoader').get();

let sequelize = null;
function getSequelize(config) {
	if (!sequelize) {
		sequelize = new Sequelize(
			config.dbSettings.database,
			config.dbSettings.username,
			config.dbSettings.password,
			config.dbSettings.options,
		);
		//console.log('dbContext created ....');
	}
	return sequelize;
}

/*function syncAll() {
	getSequelize().sync({ force: true });
	console.log('database synchronized ...');
}*/

//module.exports.syncAll = syncAll;
module.exports.getContext = getSequelize;
