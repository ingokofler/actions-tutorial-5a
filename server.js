const https = require('https');
const fs = require('fs');

const express = require('express');
const bearerToken = require('express-bearer-token');

require('colors');

const configLoader = require('./environments/configLoader');
const dbConnector = require('./commons/dbConnector');
const cors = require('./middleware/cors');
const { handleError, criticalErrorAnswer } = require('./errorhandling/error-handler');

// Steps 
// 1.) SYNC Load configuration based on Enviroment Files 
// 2.) ASYNC Try to connect to database
// 3.) SNYC Setup and configure Backend - Application 
// 4.) ASYNC Start WebServer

const app = express();
let configuration = loadConfig();	 // if call fails, process exited (1)

// only in devevelopment environment and if mocha is running tests
if (configuration.devOptions && configuration.devOptions.runningMochaTests)
	module.exports = app;

// now do the async tasks 
(async function main() {
	let dbConnectionOK = await connectDatabase(configuration);

	if (dbConnectionOK)
		// if call fails, process exited (1)
		configure(configuration);
	else
		configureInErrorMode();

	// turn web-server on 
	startWebServer(configuration);
})();


function loadConfig() {
	let configuration = null;
	try {
		configuration = configLoader.get();
		console.log(`SUCCESS: configuration '${configuration.name}' loaded.`.green);
	} catch (err) {
		console.error(`ERROR: loading configuration ${err}`);
		process.exit(1);
	}
	return configuration;
}

async function connectDatabase(configuration) {
	// connect to database	
	let dbConnectOK = false;
	try {
		let dbContext = await dbConnector.getContext(configuration);
		await dbContext.authenticate();
		console.log('SUCCESS: Database-Connection established.'.green);

		// use this statement to sync the models
		if (configuration.devOptions.recreateDatabase && !configuration.devOptions.mockdata) {
			await dbContext.queryInterface.dropAllTables();
			dbContext.sync();
			console.log('WARNING: Database recreated'.yellow);
		}
		dbConnectOK = true;
	} catch (err) {
		console.error(`ERROR: Could not connect to database: ${err}`.red);
	}

	return dbConnectOK;
}

function configure(configuration) {
	try {
		app.use(express.json());
		app.use(bearerToken());
		app.use(cors.enable);

		console.log('\nLoading all routes ....'.green);
		loadAllRoutes(configuration);
		console.log('SUCCESS: Application configured.'.green);
	} catch (err) {
		console.error(`ERROR: Could not configure application: ${err}`);
		process.exit(1);
	}
}

function configureInErrorMode() {
	app.get('*', criticalErrorAnswer);
	console.log('WARNING: APP running in ERROR MODE'.yellow);
}

function loadAllRoutes(config) {
	const userRouter = require('./user/user-router');
	const authRouter = require('./authentication/auth-router').router;
	const pupilRouter = require('./pupils/pupil-router');

	const { authenticate } = require('./authentication/auth-router');

	app.use(`${config.backend.apiPrefix}/users`, userRouter);
	console.log(`${config.backend.apiPrefix}/users `.green);

	app.use(`${config.backend.apiPrefix}`, authRouter);
	console.log(`${config.backend.apiPrefix}/login /logout /whoIAm`.green);

	app.use(authenticate);
	// Restricted Area	
	app.use(`${config.backend.apiPrefix}/pupils`, pupilRouter);
	console.log(`${config.backend.apiPrefix}/pupils `.green);

	app.use(handleError);
}

function startWebServer(configuration) {
	// turn web-server on 
	try {
		https
			.createServer(
				{
					key: fs.readFileSync(configuration.security.certKeyFilePath),
					cert: fs.readFileSync(configuration.security.certFilePath),
				},
				app,
			)
			.listen(
				configuration.backend.port,
				configuration.backend.hostname,
				() => {
					console.log(
						`SUCCESS: Template Backend is up and running on ${configuration.backend.hostname}:${configuration.backend.port}`.green,
					);
					if (typeof app.onListenComplete == 'function')
						app.onListenComplete();
				});
	} catch (err) {
		console.error(`ERROR: Backend fatal error: ${err}`.red);
	}
}
