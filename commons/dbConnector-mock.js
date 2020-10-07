
function syncAll() {
}

module.exports.syncAll = syncAll;
module.exports.getContext = () => {
	let result = {};
	result.authenticate = () => {
		return new Promise((resolve) => { resolve(); });
	};
	return result;
};

