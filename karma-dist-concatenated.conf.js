const common = require('./karma-common.conf.js');

module.exports = function(config) {
	const configuration = {
		basePath: '../',
		singleRun: true,
		autoWatch: true,
		logLevel: 'INFO',
		// list of files / patterns to load in the browser
		files: [
			'node_modules/angular/angular.js',
			'node_modules/angular-sanitize/angular-sanitize.js',
			'node_modules/angular-mocks/angular-mocks.js',
			'dist/ng-search-and-select.js',
			'test/unit/**/*.js'
		],
	};

	config.set(Object.assign(configuration, common));
};
