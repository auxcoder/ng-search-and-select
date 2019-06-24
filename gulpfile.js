const fs = require('fs');
const gulp = require('gulp');
const karma = require('karma');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const path = require('path');
const plumber = require('gulp-plumber'); // Prevent pipe breaking caused by errors from gulp plugins
const eslint = require('gulp-eslint');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const angularTemplatecache = require('gulp-angular-templatecache');
var strip = require('gulp-strip-comments');

// Source directory for build process
var rootDirectory = path.resolve('./');
var sourceDirectory = path.join(rootDirectory, './src');
var distDirectory = path.join(rootDirectory, './dist');
var tmpDirectory = path.join(rootDirectory, './.tmp');
var testDirectory = path.join(rootDirectory, './test/unit');
var sourceFiles = [
  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),
  path.join('.tmp/*.js')
];
var watchFiles = [
  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),
  path.join(sourceDirectory, '/**/*.html'),
  path.join(sourceDirectory, '/**/*.scss'),
  // Then add all JavaScript files
  // path.join(sourceDirectory, '/**/*.js')
];
var lintFiles = [
  'gulpfile.js',
  // Karma configuration
  'karma-*.conf.js'
].concat(watchFiles);
var MODULE_NAME = 'ngSearchAndSelect';
var COMPONENT = 'component';

// Partials templates
gulp.task('partials', partials);
function partials() {
	return gulp
		.src('./src/**/*.html')
		.pipe(htmlmin({
			ignoreCustomFragments: [/{{.*?}}/],
		}))
		.pipe(
			angularTemplatecache('template-cache-html.js', {
				module: 'ngSearchAndSelect.component',
				// root: 'ng-search-and-select',
			})
		)
		.pipe(gulp.dest('.tmp'));
}

function toCss() {
	return gulp.src('./src/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed',
			sourceMap: true
		}).on('error', sass.logError))
		.pipe(rename('styles.css'))
		.pipe(gulp.dest(tmpDirectory));
}

function styles(done) {
	var filename = `${tmpDirectory}/styles.css`;
	var css = fs.readFileSync(filename).toString().replace(/\n.*$/gm, '');
	var styles = `angular.module('${MODULE_NAME}.${COMPONENT}').run(function() { angular.element(document).find('head').prepend('<style type="text/css">${css}</style>')});`;
	fs.writeFileSync(`${tmpDirectory}/styles.js`, styles);
	done();
}

function build() {
	return gulp.src(sourceFiles)
		.pipe(plumber())
		.pipe(strip())
		.pipe(concat('ng-search-and-select.js'))
		.pipe(gulp.dest(distDirectory))
		.pipe(uglify().on('error', console.error))
		.pipe(rename('ng-search-and-select.min.js'))
		.pipe(gulp.dest(distDirectory));
}

function lint() {
	return gulp.src(lintFiles)
		.pipe(plumber())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
}

function karmaFinishHandler(done) {
	return (failCount = 0) => {
		// eslint-disable-next-line angular/log
		done(failCount ? console.log(`Failed ${failCount} tests.`) : null);
	};
}

function test(done) {
	const configFile = __dirname + '/karma-src.conf.js';
	configFile.singleRun = false;
	const karmaServer = new karma.Server({ configFile }, karmaFinishHandler(done));
	karmaServer.start();
}


function testDist(done) {
	const configFile = __dirname + '/karma-dist-concatenated.conf.js';
	const karmaServer = new karma.Server({ configFile }, karmaFinishHandler(done));
	karmaServer.start();
}

function testDistMin(done) {
	const configFile = __dirname + '/karma-dist-minified.conf.js';
	const karmaServer = new karma.Server({ configFile }, karmaFinishHandler(done));
	karmaServer.start();
}

function watch() {
	// Watch JavaScript files
	gulp.watch(watchFiles, gulp.series(lint, test, build));
	// watch test files and re-run unit tests when changed
	gulp.watch(path.join(testDirectory, '/**/*.js'), gulp.series(test));
}

exports.test = gulp.series(test);
exports.testDist = gulp.series(testDist);
exports.testDistMin = gulp.series(testDistMin);
exports.build = gulp.series(partials, toCss, styles, build);
exports.default = gulp.series(lint, test, build, watch);
