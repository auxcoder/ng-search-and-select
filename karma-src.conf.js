const common = require('./karma-common.conf.js');

module.exports = function(config) {
	const configuration = {
		basePath: '../',
		singleRun: true,
		autoWatch: false,
		logLevel: 'INFO',
	};

	config.set(Object.assign(configuration, common));
};
