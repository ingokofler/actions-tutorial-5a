//let server = require('../server');
module.exports.server = require('../server');

module.exports.config = require('../environments/configLoader').get();

module.exports.checkErrorResponse = (res) => {
	res.body.should.be.a('object');
	res.body.should.have.property('code').not.to.be.null;
	res.body.should.have.property('message').not.to.be.null;
};

module.exports.ensureServerIsRunning = (server, doneHandler) => {
	if (!server.running) {
		server.onListenComplete = () => {
			server.running = true;
			doneHandler();
		};
	} else {
		doneHandler();
	}
};