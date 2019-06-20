var gulp = require('gulp');
var karma = require('karma').server;
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('path');
var plumber = require('gulp-plumber'); // Prevent pipe breaking caused by errors from gulp plugins
// var runSequence = require('run-sequence');
var eslint = require('gulp-eslint');


/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');

// tests
var testDirectory = path.join(rootDirectory, './test/unit');

var sourceFiles = [
  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),
  // Then add all JavaScript files
  // path.join(sourceDirectory, '/**/*.js')
];

var lintFiles = [
  'gulpfile.js',
  // Karma configuration
  'karma-*.conf.js'
].concat(sourceFiles);

gulp.task('build', function(done) {
	gulp.src(sourceFiles)
		.pipe(plumber())
		.pipe(concat('ng-search-and-select.js'))
		.pipe(gulp.dest('./dist/'))
		.pipe(uglify())
		.pipe(rename('ng-search-and-select.min.js'))
		.pipe(gulp.dest('./dist'));
	done();
});

/**
 * Validate source JavaScript
 */
gulp.task('lint', function () {
	return gulp.src(lintFiles)
		.pipe(plumber())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

/**
 * Run test once and exit
 */
gulp.task('test-src', function (done) {
	karma.start({
		configFile: __dirname + '/karma-src.conf.js',
		singleRun: true
	}, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-concatenated', function (done) {
	karma.start({
		configFile: __dirname + '/karma-dist-concatenated.conf.js',
		singleRun: true
	}, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-minified', function (done) {
	karma.start({
		configFile: __dirname + '/karma-dist-minified.conf.js',
		singleRun: true
	}, done);
});

gulp.task('watch', function () {
	// Watch JavaScript files
	gulp.watch(sourceFiles, gulp.series('process-all'));
	// watch test files and re-run unit tests when changed
	gulp.watch(path.join(testDirectory, '/**/*.js'), gulp.series('test-src'));
});

gulp.task('process-all', gulp.series('lint', 'test-src', 'build'));
gulp.task('default', gulp.series('process-all', 'watch'));
// gulp.task('process-all', function (done) {
//   runSequence('lint', 'test-src', 'build', done);
// });
