// load all from config-file
// start options 
// see package.json and launch.json
let currentConfiguration = null;
const defaultEnvironmentFile = 'env-development.json';

module.exports.get = () => {
	if (currentConfiguration === null) {
		load();
	}
	return Object.freeze(currentConfiguration);
};

const load = () => {
	let configFilename = getConfigFilename();
	currentConfiguration = require('./' + configFilename);

	currentConfiguration.devOptions.runningMochaTests = runningMochaTestCases();
	if (currentConfiguration.devOptions.runningMochaTests) {
		// mocha test cases always starts with a new database 
		currentConfiguration.devOptions.recreateDatabase = true;
		console.log('WARNING: mocha Testcases running now'.yellow);
		console.log('WARNING: set recreateDatabase to TRUE'.yellow);
	}
};

function getConfigFilename() {
	//console.log(process.argv);
	let argvIdx = process.argv.indexOf('--configFile');
	let configFilename = argvIdx > 0 ? process.argv[argvIdx + 1] : null;

	if (!configFilename) {
		configFilename = defaultEnvironmentFile;
		console.log(`WARNING: no environment file provided. Switching to default-file (filename): ${configFilename}`.yellow);
	}

	return configFilename;
}

function runningMochaTestCases() {
	return process.argv[1].includes('mocha');
}
