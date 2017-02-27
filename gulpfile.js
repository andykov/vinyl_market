'use strict';
// var gulp = require('gulp');
// var using = require('gulp-using');
// var grep = require('gulp-grep');
// var changed = require('gulp-changed');
// var del = require('del');
// var coffee = require('gulp-coffee');
// var less = require('gulp-less');
// var coffeelint = require('gulp-coffeelint');
// var sourcemaps = require('gulp-sourcemaps');
// var replaceHtml = require('gulp-html-replace');
// var ngAnnotate = require('gulp-ng-annotate');
// var minifyJson = require('gulp-jsonminify');
// var minifyImg = require('gulp-imagemin');
// var uglifyJs = require('gulp-uglify');
// var minifyCss= require('gulp-minify-css');
// var concat = require('gulp-concat');
// var sass = require('gulp-sass');
// var browserSync = require('browser-sync');
// var karma = require('karma').server;
// var webdriver_standalone = require('gulp-protractor').webdriver_standalone;
// var webdriver_update = require('gulp-protractor').webdriver_update;
// var protractor = require('gulp-protractor').protractor;
// var exit = require('gulp-exit');
// var merge = require('merge-stream');
// var order = require('gulp-order');

const gulp = require('gulp');
const sass = require('gulp-sass');
const csscomb = require('gulp-csscomb');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const debug = require('gulp-debug');
const newer = require('gulp-newer');
const remember = require('gulp-remember');
const cached = require('gulp-cached');
const notify = require('gulp-notify');
const include = require('gulp-include');
const hologram = require('gulp-hologram');
const stripCssComments = require('gulp-strip-css-comments');
const browserSync = require('browser-sync').create();
const del = require('del');


var path = {
	root: 'build/', // корень
	build: {
		html: 'build/html/',
		css: 'build/css',
		js: 'build/js',
		img: 'build/img',
		sprites: 'build/img/sprites',
		svg: 'build/img/svg-sprite',
		fonts: 'build/fonts',
	},
	src: {
		html: [
			'src/html/**/*.html',
			// '!src/html/include/*.html',
			// '!src/html/components/*.html',
		],
		scss: [
			'src/scss/**/*.scss',
			'!src/scss/utils/util.scss'
		],
		css: 'src/scss/libs/*.css',
		scripts: 'src/scripts/**/*.js',
		images: [
			'src/images/**/*.+(jpg|jpeg|gif|png)',
			'!src/images/sprites/**/*.+(jpg|jpeg|gif|png)'
		],
		// sprites: 'src/images/sprites/**/*.+(jpg|jpeg|gif|png)',
		// svg: 'src/images/sprites/svg/*.svg',
		// spritescss: 'src/styles/utils/var-sprites',
		// svg: 'src/images/svg/*.svg',
		fonts: 'src/fonts/**/*.*',
	}
}


/*--------------------------------------------------------------
# HTML
--------------------------------------------------------------*/
gulp.task('html', function () {
	return gulp.src(path.src.html)
		.pipe(include()).on('error', console.log)
		.pipe(gulp.dest(path.build.html))
});


/*--------------------------------------------------------------
# SASS
--------------------------------------------------------------*/
gulp.task('scss', function() {
	return gulp.src(path.src.scss)
		// .pape(cached('styles'))
		.pipe(sourcemaps.init())
		.pipe(debug({title: 'завершен src'}))
		.pipe(sass())
		.on('error', notify.onError(function(err){
			return {
				title: 'SASS',
				message: err.message
			};
		}))
		.pipe(stripCssComments())
		.pipe(autoprefixer({browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']}))
		.pipe(csscomb())
		.pipe(debug({title: 'завершен sass'}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.build.css));
});

gulp.task('hologram', function() {
	return gulp.src('./styleguide/hologram_config.yml')
		.pipe(hologram({logging:true})
		.on('error', notify.onError(function(err){
			return {
				title: 'HOLOGRAM',
				message: err.message
			};
		})));
});

gulp.task('style', gulp.series('scss', 'hologram'));

/*--------------------------------------------------------------
# Copying css files library
--------------------------------------------------------------*/
gulp.task('copy:css', function() {
	return gulp.src(path.src.css)
		.pipe(gulp.dest(path.build.css));
});


/*--------------------------------------------------------------
# Copying javascript files library
--------------------------------------------------------------*/
gulp.task('copy:js', function() {
	return gulp.src(path.src.scripts)
		.pipe(gulp.dest(path.build.js));
});


/*--------------------------------------------------------------
# Copying files fonts
--------------------------------------------------------------*/
gulp.task('copy:fonts', function() {
	return gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts));
});


/*--------------------------------------------------------------
# Delete folder build
--------------------------------------------------------------*/
gulp.task('clean', function() {
	return del('build');
});


/*--------------------------------------------------------------
# Copying files images and optimization
--------------------------------------------------------------*/
gulp.task('images', function() {
	return gulp.src(path.src.images, {since: gulp.lastRun('images')})
		.pipe(newer('build'))
		.pipe(debug({title: 'Копирование картинок'}))
		.pipe(gulp.dest(path.build.img));
});


gulp.task('build', gulp.series('clean', 
	gulp.parallel('html', 'style', 'images', 'copy:css', 'copy:js', 'copy:fonts'))
);


/*--------------------------------------------------------------
# Tracking changes files
--------------------------------------------------------------*/
gulp.task('watch', function() {
	gulp.watch(path.src.html, gulp.series('html'));
	gulp.watch(path.src.scss, gulp.series('style'));
	gulp.watch(path.src.images, gulp.series('images'));
	gulp.watch(path.src.css, gulp.series('copy:css'));
	gulp.watch(path.src.scripts, gulp.series('copy:js'));
	gulp.watch(path.src.fonts, gulp.series('copy:fonts'));
});


/*--------------------------------------------------------------
# Local server
--------------------------------------------------------------*/
gulp.task('server', function() {
	browserSync.init({
		server: './'
		// tunnel: true,
	});

	browserSync.watch('build/**/*.*').on('change', browserSync.reload);
	browserSync.watch('src/scss/styleguide.md').on('change', browserSync.reload);
	browserSync.watch('styleguide/doc_assets/*.*').on('change', browserSync.reload);
	browserSync.watch('styleguide/hologram_config.yml').on('change', browserSync.reload);
});

/*--------------------------------------------------------------
# Default command run all tasks
--------------------------------------------------------------*/
gulp.task('default', 
	gulp.series('build', gulp.parallel('watch', 'server'))
);