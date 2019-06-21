const fs = require('fs');
const gulp = require('gulp');
const karma = require('karma').server;
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

gulp.task('styles', styles);
function styles() {
	return gulp.src('./src/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(rename('styles.css'))
		.pipe(gulp.dest(tmpDirectory));
}

gulp.task('prepend-styles', function (done) {
	var filename = `${tmpDirectory}/styles.css`;
	var css = fs.readFileSync(filename).toString();
	var styles = `angular.module('${MODULE_NAME}.${COMPONENT}').run(function() { angular.element(document).find('head').prepend('<style type="text/css">${css}</style>')});`;
	fs.writeFileSync(`${tmpDirectory}/styles.js`, styles);
	done();
});

gulp.task('build', gulp.series(partials, styles, function(done) {
	gulp.src(sourceFiles)
		.pipe(plumber())
		.pipe(strip())
		.pipe(concat('ng-search-and-select.js'))
		.pipe(gulp.dest(distDirectory))
		.pipe(uglify().on('error', console.error))
		.pipe(rename('ng-search-and-select.min.js'))
		.pipe(gulp.dest(distDirectory));
	done();
}));

gulp.task('lint', function () {
	return gulp.src(lintFiles)
		.pipe(plumber())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('test-src', function (done) {
	karma.start({
		configFile: __dirname + '/karma-src.conf.js',
		singleRun: true
	}, done);
});

gulp.task('test-dist-concatenated', function (done) {
	karma.start({
		configFile: __dirname + '/karma-dist-concatenated.conf.js',
		singleRun: true
	}, done);
});

gulp.task('test-dist-minified', function (done) {
	karma.start({
		configFile: __dirname + '/karma-dist-minified.conf.js',
		singleRun: true
	}, done);
});

gulp.task('watch', function () {
	// Watch JavaScript files
	gulp.watch(watchFiles, gulp.series('process-all'));
	// watch test files and re-run unit tests when changed
	gulp.watch(path.join(testDirectory, '/**/*.js'), gulp.series('test-src'));
});

gulp.task('process-all', gulp.series('lint', 'test-src', 'partials', 'build'));
gulp.task('default', gulp.series('process-all', 'watch'));
