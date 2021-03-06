module.exports = {
	// base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: '',

	// frameworks to use
	// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	frameworks: ['mocha', 'chai-jquery', 'jquery-1.8.3', 'sinon-chai'],

	plugins: [
		'karma-mocha',
		'karma-chai',
		'karma-sinon-chai',
		'karma-chrome-launcher',
		'karma-phantomjs-launcher',
		'karma-jquery',
		'karma-chai-jquery',
		'karma-spec-reporter'
	],

	// list of files / patterns to load in the browser
	files: [
		'node_modules/angular/angular.js',
		'node_modules/angular-sanitize/angular-sanitize.js',
		'node_modules/angular-mocks/angular-mocks.js',
		'src/**/*.module.js',
		// 'src/**/*.js',
		'test/unit/**/*.js'
	],

	// list of files to exclude
	exclude: [
	],

	// preprocess matching files before serving them to the browser
	// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
	preprocessors: {
	},

	// test results reporter to use
	// possible values: 'dots', 'progress'
	// available reporters: https://npmjs.org/browse/keyword/karma-reporter
	reporters: ['progress', 'spec'],

	// web server port
	port: 9876,

	// enable / disable colors in the output (reporters and logs)
	colors: true,

	// start these browsers
	// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
	browsers: ['PhantomJS', 'ChromeHeadless'],

}
