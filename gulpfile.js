var gulp = require('gulp');
var karma = require('karma').server;
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('path');
var plumber = require('gulp-plumber'); // Prevent pipe breaking caused by errors from gulp plugins
var eslint = require('gulp-eslint');
const htmlmin = require('gulp-htmlmin');
const angularTemplatecache = require('gulp-angular-templatecache');

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');
var distDirectory = path.join(rootDirectory, './dist');
var testDirectory = path.join(rootDirectory, './test/unit');

var sourceFiles = [
  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),
  path.join(distDirectory, '/templateCacheHtml.js')
];

var watchFiles = [
  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),
  // Then add all JavaScript files
  // path.join(sourceDirectory, '/**/*.js')
];

var lintFiles = [
  'gulpfile.js',
  // Karma configuration
  'karma-*.conf.js'
].concat(watchFiles);

// Partials templates
gulp.task('partials', partials);
function partials() {
	return gulp
		.src('./src/**/*.html')
		.pipe(htmlmin({
			ignoreCustomFragments: [/{{.*?}}/],
		}))
		.pipe(
			angularTemplatecache('templateCacheHtml.js', {
				module: 'ngSearchAndSelect.component',
				root: 'app',
			})
		)
		.pipe(gulp.dest('./dist'));
}

gulp.task('build', gulp.series(partials, function(done) {
	gulp.src(sourceFiles)
		.pipe(plumber())
		.pipe(concat('ng-search-and-select.js'))
		.pipe(gulp.dest('./dist/'))
		.pipe(uglify())
		.pipe(rename('ng-search-and-select.min.js'))
		.pipe(gulp.dest('./dist'));
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

gulp.task('process-all', gulp.series('lint', 'test-src', partials,'build'));
gulp.task('default', gulp.series('process-all', 'watch'));
