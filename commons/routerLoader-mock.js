const configLoader = require('../environments/configLoader');
const moduleSuffix = '-mock';

const userRouter = require('../user/user-router' + moduleSuffix);
const authRouter = require('../authentication/auth-router' + moduleSuffix).router;
const { authenticate } = require('../authentication/auth-router' + moduleSuffix);

const config = configLoader.get();

module.exports.use = (app) => {
	app.use(`${config.backend.apiPrefix}/users`, userRouter);
	app.use(`${config.backend.apiPrefix}`, authRouter);
	app.use(authenticate);
	// Restricted Area
	// currently no mock-Router 
};