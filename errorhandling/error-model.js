const Sequelize = require('sequelize');

class AppError extends Error {
	constructor(codeOrException, message) {
		let parameterValidationOK = false;
		let stack = null;
		let logMessage = null;

		// type-checking 
		// first object is already a AppError
		if (codeOrException instanceof Error && codeOrException.code && codeOrException.message) {
			message = codeOrException.message;
			logMessage = codeOrException.message;
			stack = codeOrException.stack;

			codeOrException = codeOrException.code;
			parameterValidationOK = true;
		}

		// Database Validation Error
		if (codeOrException instanceof Sequelize.ValidationError) {
			// todo: make it more generic
			message = codeOrException.message + ' ' + codeOrException.name;
			logMessage = message;
			stack = codeOrException.stack;

			codeOrException = 400;
			parameterValidationOK = true;
		}

		// Unexpected Application Error
		if (codeOrException instanceof Error) {
			message = 'unexpected error';
			logMessage = codeOrException.message;
			stack = codeOrException.stack;

			codeOrException = 500;
			parameterValidationOK = true;
		}

		if (!parameterValidationOK) {
			// first parameter must be a number 
			if (isNaN(codeOrException)) {
				codeOrException = 500;
				message = 'AppError called with wrong first parameter';
			} else {
				codeOrException = Number(codeOrException);
			}
		}

		// check if it is a number - otherwise convert to 500  
		if (!parameterValidationOK && typeof (codeOrException) == 'number') {
			message = message ? message : 'unknown error';
			parameterValidationOK = true;
		}

		if (!parameterValidationOK) {
			codeOrException = 500;
		}

		super(message);
		this.code = codeOrException;
		this.message = message;

		// preserve stack
		if (stack != null) {
			this.stack = stack;
		}

		// Last step - do logging if it was an unexpected error
		if (this.code == 500) {
			console.error(logMessage);
			console.error(stack);
		}
	}
}

module.exports = AppError;
